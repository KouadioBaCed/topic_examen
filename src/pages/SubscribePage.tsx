import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Mail, Lock, User, Phone, Loader2, CreditCard, ShieldCheck,
  AlertCircle, ChevronLeft, CheckCircle, Wallet,
} from 'lucide-react';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { certifications } from '../data/certifications';
import {
  COURSE_PRICE_XOF,
  createCoursePayment,
  formatPriceXof,
  PaymentApiError,
} from '../services/payment';
import type { CertificationSlug } from '../types';

interface PendingSignup {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  courseSlug: CertificationSlug;
  tempUid: string;
}

export const PENDING_SIGNUP_PREFIX = 'signup:';

export const SubscribePage = () => {
  const [searchParams] = useSearchParams();
  const { firebaseUser } = useAuth();
  const { lang } = useStore();
  const certParam = searchParams.get('cert');
  const cert = certParam ? certifications.find(c => c.slug === certParam) : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clickedTerms, setClickedTerms] = useState(false);
  const [clickedPrivacy, setClickedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already-logged-in users have their own subscription flow (modal/paywall on TopicsPage).
  useEffect(() => {
    if (firebaseUser && cert) {
      window.location.replace(`/topics?cert=${cert.slug}&pay=1`);
    }
  }, [firebaseUser, cert]);

  if (!cert) {
    return <Navigate to="/" replace />;
  }

  const labels = lang === 'fr'
    ? {
        title: 'Souscrire au cours',
        subtitle: 'Créez votre compte et payez en une seule étape. Votre compte est créé uniquement après paiement réussi.',
        priceLabel: 'Tarif',
        durationLabel: 'Durée',
        durationValue: '1 mois (30 jours)',
        infoBanner: '✓ Aucun compte créé tant que le paiement n\'est pas validé.',
        section: 'Vos informations',
        fullName: 'Nom complet',
        fullNamePlaceholder: 'Votre nom complet',
        email: 'Email',
        emailPlaceholder: 'votre@email.com',
        password: 'Mot de passe',
        passwordPlaceholder: 'Au moins 6 caractères',
        phoneLabel: 'Téléphone (optionnel)',
        phonePlaceholder: '+225 0700000000',
        phoneHint: 'Numéro Mobile Money pour le paiement (vous pourrez aussi le saisir sur GeniusPay).',
        terms: 'J\'accepte les',
        termsOfUse: 'conditions d\'utilisation',
        and: 'et la',
        privacyPolicy: 'politique de confidentialité',
        cta: 'Continuer vers le paiement',
        ctaLoading: 'Création du paiement…',
        back: 'Retour',
        already: 'Déjà inscrit ?',
        loginLink: 'Connectez-vous',
        passwordTooShort: 'Le mot de passe doit faire au moins 6 caractères.',
        emailExists: 'Un compte existe déjà avec cet email. Connectez-vous puis cliquez sur le cours.',
        invalidEmail: 'Email invalide.',
        nameTooShort: 'Veuillez saisir votre nom.',
        mustAcceptTerms: 'Vous devez accepter les conditions et la politique de confidentialité.',
        secureNote: 'Vous serez redirigé vers GeniusPay pour choisir votre moyen de paiement (Wave, Orange Money, MTN, Moov, carte bancaire). Votre compte sera activé automatiquement après le paiement.',
        defaultError: "Impossible d'initier le paiement. Réessayez dans un instant.",
      }
    : {
        title: 'Subscribe to the course',
        subtitle: 'Create your account and pay in one step. Your account is created only after a successful payment.',
        priceLabel: 'Price',
        durationLabel: 'Duration',
        durationValue: '1 month (30 days)',
        infoBanner: "✓ No account is created until payment is successful.",
        section: 'Your details',
        fullName: 'Full name',
        fullNamePlaceholder: 'Your full name',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'At least 6 characters',
        phoneLabel: 'Phone (optional)',
        phonePlaceholder: '+225 0700000000',
        phoneHint: 'Mobile Money number used for the payment (you can also enter it on GeniusPay).',
        terms: 'I accept the',
        termsOfUse: 'terms of use',
        and: 'and the',
        privacyPolicy: 'privacy policy',
        cta: 'Continue to payment',
        ctaLoading: 'Creating payment…',
        back: 'Back',
        already: 'Already registered?',
        loginLink: 'Sign in',
        passwordTooShort: 'Password must be at least 6 characters.',
        emailExists: 'An account already exists with this email. Sign in then click the course.',
        invalidEmail: 'Invalid email.',
        nameTooShort: 'Please enter your name.',
        mustAcceptTerms: 'You must accept the terms and privacy policy.',
        secureNote: 'You will be redirected to GeniusPay to choose your payment method (Wave, Orange Money, MTN, Moov, bank card). Your account will be activated automatically after payment.',
        defaultError: 'Unable to initiate payment. Try again in a moment.',
      };

  function generateTempUid() {
    const random = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `pending_${random}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError(labels.nameTooShort);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError(labels.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(labels.passwordTooShort);
      return;
    }
    if (!(acceptedTerms && clickedTerms && clickedPrivacy)) {
      setError(labels.mustAcceptTerms);
      return;
    }
    if (trimmedPhone && !/^\+?\d[\d\s.-]{6,}$/.test(trimmedPhone)) {
      setError(lang === 'fr' ? 'Numéro de téléphone invalide.' : 'Invalid phone number.');
      return;
    }

    setSubmitting(true);
    try {
      // Vérifier que l'email n'est pas déjà pris (sinon le createUserWithEmailAndPassword
      // après paiement échouera et le client aura payé pour rien).
      const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
      if (methods.length > 0) {
        setError(labels.emailExists);
        setSubmitting(false);
        return;
      }

      const tempUid = generateTempUid();

      const res = await createCoursePayment({
        courseSlug: cert!.slug as CertificationSlug,
        courseName: cert!.fullName || cert!.name,
        uid: tempUid,
        email: trimmedEmail,
        displayName: trimmedName,
        phone: trimmedPhone || undefined,
      });

      const pending: PendingSignup = {
        email: trimmedEmail,
        password,
        displayName: trimmedName,
        phone: trimmedPhone || undefined,
        courseSlug: cert!.slug as CertificationSlug,
        tempUid,
      };
      sessionStorage.setItem(PENDING_SIGNUP_PREFIX + res.reference, JSON.stringify(pending));

      const target = res.checkout_url || res.payment_url;
      if (!target) {
        throw new Error('checkout_url missing');
      }
      window.location.href = target;
    } catch (err) {
      const message = err instanceof PaymentApiError ? err.message : labels.defaultError;
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
          <ChevronLeft className="w-4 h-4" />
          {labels.back}
        </Link>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className="px-6 py-7 sm:px-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{labels.title}</h1>
                <p className="text-sm text-white/85 mt-1">{labels.subtitle}</p>
              </div>
            </div>
            <div className="bg-white/15 rounded-lg p-3 text-sm font-medium">
              {cert.fullName || cert.name}
            </div>
          </div>

          {/* Price + duration */}
          <div className="px-6 sm:px-8 py-5 grid grid-cols-2 gap-3 border-b border-dark-200 dark:border-dark-700">
            <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.priceLabel}</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{formatPriceXof(COURSE_PRICE_XOF)}</p>
            </div>
            <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.durationLabel}</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{labels.durationValue}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4">
            <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 p-3 text-xs text-green-800 dark:text-green-300">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{labels.infoBanner}</span>
            </div>

            <h2 className="text-sm font-semibold text-dark-900 dark:text-white pt-2">{labels.section}</h2>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{labels.fullName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="input pl-10 py-2.5"
                  placeholder={labels.fullNamePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{labels.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10 py-2.5"
                  placeholder={labels.emailPlaceholder}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{labels.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input pl-10 py-2.5"
                  placeholder={labels.passwordPlaceholder}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{labels.phoneLabel}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10 py-2.5"
                  placeholder={labels.phonePlaceholder}
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <p className="mt-1.5 text-xs text-dark-500 dark:text-dark-400">{labels.phoneHint}</p>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-xs text-dark-600 dark:text-dark-400 cursor-pointer">
                {labels.terms}{' '}
                <a href="/privacy" target="_blank" onClick={() => setClickedTerms(true)} className={`underline ${clickedTerms ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400 hover:opacity-80'}`}>{labels.termsOfUse}</a>{' '}
                {labels.and}{' '}
                <a href="/privacy" target="_blank" onClick={() => setClickedPrivacy(true)} className={`underline ${clickedPrivacy ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400 hover:opacity-80'}`}>{labels.privacyPolicy}</a>
              </label>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 p-3 text-xs text-primary-800 dark:text-primary-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{labels.secureNote}</span>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {labels.ctaLoading}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {labels.cta}
                </>
              )}
            </button>

            <p className="text-center text-xs text-dark-500 dark:text-dark-400 pt-2">
              {labels.already}{' '}
              <Link to={`/login?cert=${cert.slug}`} className="text-primary-600 dark:text-primary-400 underline hover:opacity-80">
                {labels.loginLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
