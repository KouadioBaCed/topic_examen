import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Loader2, AlertTriangle, ArrowRight, RefreshCw, Clock,
  Mail, Lock, KeyRound,
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { certifications } from '../data/certifications';
import {
  verifyCoursePayment,
  grantCourseAccessAfterPayment,
  formatPriceXof,
  type VerifyPaymentResponse,
} from '../services/payment';
import { PENDING_SIGNUP_PREFIX } from './SubscribePage';
import type { AppUser, CertificationSlug, CourseSubscription } from '../types';

interface PendingSignup {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  courseSlug: CertificationSlug;
  tempUid: string;
}

async function createOrLoginAndGrantAccess(
  email: string,
  password: string,
  displayName: string,
  courseSlug: CertificationSlug,
  reference: string,
  amount: number,
  currency: string,
  paymentMethod?: string | null,
  completedAt?: string | null,
): Promise<void> {
  let uid: string;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    uid = cred.user.uid;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
    } else {
      throw err;
    }
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  const subscription: CourseSubscription = {
    courseSlug,
    reference,
    amount,
    currency: currency || 'XOF',
    paidAt: completedAt || now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    paymentMethod: paymentMethod ?? null,
  };

  const userData: AppUser = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    role: 'user',
    isActive: true,
    allowedCourses: [courseSlug],
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    courseSubscriptions: [subscription],
  };

  await setDoc(doc(db, 'users', uid), userData);
}

type Status = 'verifying' | 'granted' | 'pending' | 'failed' | 'invalid' | 'claim';

const PENDING_STATUSES = ['pending', 'processing', 'initiated'] as const;
const COMPLETED_STATUSES = ['completed', 'success', 'successful', 'paid'] as const;
const MAX_VERIFY_ATTEMPTS = 8; // ~16 secondes au total avec 2s entre chaque
const VERIFY_RETRY_DELAY_MS = 2000;

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { firebaseUser, appUser, refreshAppUser } = useAuth();
  const { lang } = useStore();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTxStatus, setLastTxStatus] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<VerifyPaymentResponse | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [details, setDetails] = useState<{
    reference: string;
    amount: number;
    currency: string;
    courseSlug: CertificationSlug;
    expiresAt?: string;
  } | null>(null);

  // Claim form state (utilisé si sessionStorage perdu mais paiement OK).
  const [claimEmail, setClaimEmail] = useState('');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimDisplayName, setClaimDisplayName] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // GeniusPay peut rediriger avec un ID de checkout (TXN-…) que leur endpoint
  // /payments/{id} ne reconnaît pas — la résolution TXN→MTX est gérée côté
  // serveur dans verify-payment via le cookie HttpOnly `gpRef`. Le client se
  // contente donc de transmettre la ref URL, et localStorage sert seulement de
  // dernier filet si jamais le cookie a été bloqué (Safari ITP, navigateur tiers).
  const urlReference = searchParams.get('reference')
    || searchParams.get('payment_reference')
    || searchParams.get('ref')
    || '';
  const storedReference = (() => {
    try { return localStorage.getItem('lastPaymentReference') || ''; } catch { return ''; }
  })();
  const reference = urlReference || storedReference;
  const courseFromQuery = searchParams.get('course') as CertificationSlug | null;

  const finalize = useCallback(async (tx: VerifyPaymentResponse, courseSlug: CertificationSlug) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    setDetails({
      reference: tx.reference,
      amount: tx.amount,
      currency: tx.currency || 'XOF',
      courseSlug,
      expiresAt: expiresAt.toISOString(),
    });
    setStatus('granted');
    sessionStorage.removeItem(`payment:${tx.reference}`);
    try { localStorage.removeItem('lastPaymentReference'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function tick() {
      if (cancelled) return;
      if (!reference) {
        setStatus('invalid');
        return;
      }

      attempts += 1;
      setAttemptCount(attempts);

      try {
        const tx = await verifyCoursePayment(reference);
        if (cancelled) return;
        setLastTx(tx);
        setLastTxStatus(tx.status);

        const courseSlug = (tx.metadata?.course_slug || courseFromQuery || '') as CertificationSlug;
        if (!courseSlug) {
          setStatus('invalid');
          setErrorMessage(`Aucun course_slug dans les metadata (status="${tx.status}")`);
          return;
        }

        const txStatus = (tx.status || '').toLowerCase();
        const isCompleted = (COMPLETED_STATUSES as readonly string[]).includes(txStatus);
        const isPending = (PENDING_STATUSES as readonly string[]).includes(txStatus);

        if (isCompleted) {
          // Cas A : signup en attente dans sessionStorage → on crée le compte.
          const pendingRaw = sessionStorage.getItem(PENDING_SIGNUP_PREFIX + tx.reference);
          if (pendingRaw && !firebaseUser) {
            const pending = JSON.parse(pendingRaw) as PendingSignup;
            await createOrLoginAndGrantAccess(
              pending.email,
              pending.password,
              pending.displayName,
              pending.courseSlug,
              tx.reference,
              tx.amount,
              tx.currency,
              tx.payment_method,
              tx.completed_at,
            );
            await refreshAppUser();
            sessionStorage.removeItem(PENDING_SIGNUP_PREFIX + tx.reference);
            await finalize(tx, courseSlug);
            return;
          }

          // Cas B : utilisateur déjà connecté → on étend simplement l'accès.
          if (firebaseUser) {
            const uid = appUser?.uid || firebaseUser.uid;
            await grantCourseAccessAfterPayment(uid, courseSlug, tx);
            await refreshAppUser();
            await finalize(tx, courseSlug);
            return;
          }

          // Cas C : paiement OK mais sessionStorage perdu et utilisateur non connecté
          // → on propose un formulaire pour réclamer le compte.
          const metadataEmail = tx.metadata?.email || '';
          const metadataName = tx.metadata?.display_name || '';
          setClaimEmail(metadataEmail);
          setClaimDisplayName(metadataName);
          setDetails({
            reference: tx.reference,
            amount: tx.amount,
            currency: tx.currency || 'XOF',
            courseSlug,
          });
          setStatus('claim');
          return;
        }

        if (isPending) {
          setDetails({
            reference: tx.reference,
            amount: tx.amount,
            currency: tx.currency || 'XOF',
            courseSlug,
          });

          if (attempts < MAX_VERIFY_ATTEMPTS) {
            // Le paiement vient d'être effectué, GeniusPay peut mettre quelques secondes
            // à propager le passage à "completed". On retente automatiquement.
            setStatus('verifying');
            setTimeout(tick, VERIFY_RETRY_DELAY_MS);
            return;
          }
          setStatus('pending');
          return;
        }

        // Statut explicitement non reconnu (failed, cancelled, expired, ou autre)
        setStatus('failed');
        setErrorMessage(`Statut renvoyé par GeniusPay : "${tx.status}"`);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        // En cas d'erreur réseau transitoire, on retente quelques fois.
        if (attempts < MAX_VERIFY_ATTEMPTS) {
          setStatus('verifying');
          setErrorMessage(message);
          setTimeout(tick, VERIFY_RETRY_DELAY_MS);
          return;
        }
        setStatus('failed');
        setErrorMessage(message);
      }
    }

    tick();
    return () => {
      cancelled = true;
    };
  }, [reference, firebaseUser, appUser, courseFromQuery, refreshAppUser, finalize]);

  async function handleManualRetry() {
    setStatus('verifying');
    setErrorMessage(null);
    setAttemptCount(0);
    // Re-déclenche l'effet en réinitialisant lastTx (pas idéal, plus simple : reload).
    window.location.reload();
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!lastTx || !details) return;
    setClaimError(null);
    const enteredEmail = claimEmail.trim().toLowerCase();

    if (claimPassword.length < 6) {
      setClaimError(lang === 'fr' ? 'Mot de passe trop court (6 caractères min).' : 'Password too short (min 6 chars).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(enteredEmail)) {
      setClaimError(lang === 'fr' ? 'Email invalide.' : 'Invalid email.');
      return;
    }

    // SÉCURITÉ : si la transaction a été créée avec un email (metadata),
    // on n'autorise la réclamation que pour cet email. Empêche le vol d'accès
    // par un tiers ayant intercepté la référence MTX-…
    const expectedEmail = (lastTx.metadata?.email || '').toLowerCase().trim();
    if (expectedEmail && expectedEmail !== enteredEmail) {
      setClaimError(lang === 'fr'
        ? "Cet email ne correspond pas au paiement. Saisissez l'email utilisé lors de la souscription."
        : 'This email does not match the payment. Enter the email used during subscription.');
      return;
    }

    setClaimSubmitting(true);
    try {
      await createOrLoginAndGrantAccess(
        enteredEmail,
        claimPassword,
        claimDisplayName.trim() || enteredEmail.split('@')[0],
        details.courseSlug,
        lastTx.reference,
        lastTx.amount,
        lastTx.currency,
        lastTx.payment_method,
        lastTx.completed_at,
      );
      await refreshAppUser();
      await finalize(lastTx, details.courseSlug);
    } catch (err) {
      const code = (err as { code?: string }).code;
      let msg = err instanceof Error ? err.message : 'Erreur inconnue';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = lang === 'fr'
          ? 'Mot de passe incorrect pour cet email existant.'
          : 'Incorrect password for the existing email.';
      }
      setClaimError(msg);
      setClaimSubmitting(false);
    }
  }

  const cert = details?.courseSlug
    ? certifications.find(c => c.slug === details.courseSlug)
    : null;

  const labels = lang === 'fr'
    ? {
        verifying: 'Vérification du paiement…',
        verifyingDesc: 'Merci de patienter pendant que nous validons votre transaction.',
        attempts: 'Tentative',
        of: 'sur',
        granted: 'Paiement confirmé',
        grantedDesc: 'Votre accès au cours est activé pour 30 jours.',
        pending: 'Paiement en cours',
        pendingDesc: "Votre paiement est en cours de traitement chez GeniusPay. Cliquez sur Réessayer dans quelques secondes.",
        failed: 'Paiement non confirmé',
        failedDesc: "Nous n'avons pas pu confirmer votre paiement automatiquement. Si le montant a bien été débité, utilisez « Réessayer » ou contactez le support avec la référence ci-dessous.",
        invalid: 'Référence invalide',
        invalidDesc: "Aucune référence de paiement valide n'a été trouvée dans l'URL.",
        claimTitle: 'Finaliser la création de votre compte',
        claimDesc: "Votre paiement est confirmé ✓. Pour finaliser la création de votre compte, confirmez votre email et choisissez un mot de passe.",
        claimEmailLabel: 'Email',
        claimNameLabel: 'Nom complet',
        claimPasswordLabel: 'Mot de passe',
        claimPasswordHint: 'Si un compte existe déjà avec cet email, saisissez son mot de passe.',
        claimSubmit: 'Activer mon accès',
        access: 'Accéder au cours',
        retry: 'Réessayer la vérification',
        backHome: "Retour à l'accueil",
        reference: 'Référence',
        amount: 'Montant',
        course: 'Cours',
        expiresOn: "Accès jusqu'au",
        debugStatus: 'Statut renvoyé',
      }
    : {
        verifying: 'Verifying your payment…',
        verifyingDesc: 'Please wait while we validate your transaction.',
        attempts: 'Attempt',
        of: 'of',
        granted: 'Payment confirmed',
        grantedDesc: 'Your access to the course is active for 30 days.',
        pending: 'Payment pending',
        pendingDesc: 'Your payment is being processed by GeniusPay. Click Retry in a few seconds.',
        failed: 'Payment not confirmed',
        failedDesc: 'We could not auto-confirm your payment. If you have been charged, click Retry or contact support with the reference below.',
        invalid: 'Invalid reference',
        invalidDesc: 'No valid payment reference was found in the URL.',
        claimTitle: 'Finalize your account',
        claimDesc: 'Your payment is confirmed ✓. To finalize your account, confirm your email and pick a password.',
        claimEmailLabel: 'Email',
        claimNameLabel: 'Full name',
        claimPasswordLabel: 'Password',
        claimPasswordHint: 'If an account already exists with this email, enter that password.',
        claimSubmit: 'Activate my access',
        access: 'Open the course',
        retry: 'Retry verification',
        backHome: 'Back to home',
        reference: 'Reference',
        amount: 'Amount',
        course: 'Course',
        expiresOn: 'Access until',
        debugStatus: 'Returned status',
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4 py-10">
      <div className="card p-8 max-w-md w-full">
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="w-14 h-14 text-primary-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{labels.verifying}</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">{labels.verifyingDesc}</p>
            {attemptCount > 1 && (
              <p className="text-xs text-dark-500 mt-3">
                {labels.attempts} {attemptCount} {labels.of} {MAX_VERIFY_ATTEMPTS}
                {lastTxStatus && <span className="font-mono ml-2">({lastTxStatus})</span>}
              </p>
            )}
          </div>
        )}

        {status === 'granted' && (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">{labels.granted}</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-5">{labels.grantedDesc}</p>

            {details && (
              <div className="text-left bg-dark-50 dark:bg-dark-800/50 rounded-xl p-4 mb-5 text-sm border border-dark-200 dark:border-dark-700 space-y-2">
                {cert && (
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-500 dark:text-dark-400">{labels.course}</span>
                    <span className="font-medium text-dark-900 dark:text-white text-right">{cert.fullName || cert.name}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-dark-500 dark:text-dark-400">{labels.amount}</span>
                  <span className="font-medium text-dark-900 dark:text-white">{formatPriceXof(details.amount)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-dark-500 dark:text-dark-400">{labels.reference}</span>
                  <span className="font-mono text-xs text-dark-700 dark:text-dark-300">{details.reference}</span>
                </div>
                {details.expiresAt && (
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-500 dark:text-dark-400">{labels.expiresOn}</span>
                    <span className="font-medium text-dark-900 dark:text-white">
                      {new Date(details.expiresAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Link
              to={cert ? `/topics?cert=${cert.slug}` : '/'}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
            >
              {labels.access}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{labels.pending}</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-3">{labels.pendingDesc}</p>
            {lastTxStatus && (
              <p className="text-xs text-dark-500 mb-4 font-mono">{labels.debugStatus} : {lastTxStatus}</p>
            )}
            <button
              onClick={handleManualRetry}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {labels.retry}
            </button>
          </div>
        )}

        {status === 'claim' && details && (
          <div>
            <div className="flex flex-col items-center text-center mb-5">
              <KeyRound className="w-14 h-14 text-primary-500 mb-3" />
              <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-1">{labels.claimTitle}</h1>
              <p className="text-sm text-dark-600 dark:text-dark-400">{labels.claimDesc}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl p-3 text-xs space-y-1 mb-4">
              <div className="flex justify-between"><span className="text-dark-600 dark:text-dark-400">{labels.amount}</span><span className="font-semibold">{formatPriceXof(details.amount)}</span></div>
              <div className="flex justify-between"><span className="text-dark-600 dark:text-dark-400">{labels.reference}</span><span className="font-mono">{details.reference}</span></div>
              {cert && <div className="flex justify-between"><span className="text-dark-600 dark:text-dark-400">{labels.course}</span><span className="font-semibold text-right">{cert.name}</span></div>}
            </div>

            <form onSubmit={handleClaim} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">{labels.claimEmailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="email"
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    required
                    readOnly={!!lastTx?.metadata?.email}
                    className={`input pl-10 py-2.5 ${lastTx?.metadata?.email ? 'cursor-not-allowed opacity-80' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {lastTx?.metadata?.email && (
                  <p className="mt-1 text-[11px] text-dark-500 dark:text-dark-400">
                    {lang === 'fr'
                      ? "Email verrouillé : seul le titulaire de cet email peut activer le compte."
                      : 'Email locked: only the owner of this email can activate the account.'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">{labels.claimNameLabel}</label>
                <input
                  type="text"
                  value={claimDisplayName}
                  onChange={(e) => setClaimDisplayName(e.target.value)}
                  className="input py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-700 dark:text-dark-300 mb-1">{labels.claimPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="password"
                    value={claimPassword}
                    onChange={(e) => setClaimPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-10 py-2.5"
                    autoComplete="new-password"
                  />
                </div>
                <p className="mt-1 text-[11px] text-dark-500 dark:text-dark-400">{labels.claimPasswordHint}</p>
              </div>

              {claimError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-2.5 text-xs text-red-700 dark:text-red-300">
                  {claimError}
                </div>
              )}

              <button
                type="submit"
                disabled={claimSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                {claimSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {labels.claimSubmit}
              </button>
            </form>
          </div>
        )}

        {(status === 'failed' || status === 'invalid') && (
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              {status === 'failed' ? labels.failed : labels.invalid}
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-3">
              {status === 'failed' ? labels.failedDesc : labels.invalidDesc}
            </p>
            {(reference || lastTxStatus || errorMessage) && (
              <div className="text-left bg-dark-50 dark:bg-dark-800/50 rounded-lg p-3 mb-4 text-xs space-y-1 font-mono">
                {reference && <div><span className="text-dark-500">ref:</span> {reference}</div>}
                {lastTxStatus && <div><span className="text-dark-500">{labels.debugStatus}:</span> {lastTxStatus}</div>}
                {errorMessage && <div className="text-red-600 dark:text-red-400 break-all">err: {errorMessage}</div>}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {reference && (
                <button
                  onClick={handleManualRetry}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {labels.retry}
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 font-medium text-sm hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
              >
                {labels.backHome}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
