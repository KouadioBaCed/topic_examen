import { useEffect, useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { certifications } from '../data/certifications';
import {
  verifyCoursePayment,
  grantCourseAccessAfterPayment,
  formatPriceXof,
} from '../services/payment';
import type { CertificationSlug } from '../types';

type Status = 'verifying' | 'granted' | 'pending' | 'failed' | 'invalid';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { firebaseUser, appUser, refreshAppUser } = useAuth();
  const { lang } = useStore();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    reference: string;
    amount: number;
    currency: string;
    courseSlug: CertificationSlug;
    expiresAt?: string;
  } | null>(null);

  const reference = searchParams.get('reference')
    || searchParams.get('payment_reference')
    || searchParams.get('ref')
    || '';
  const courseFromQuery = searchParams.get('course') as CertificationSlug | null;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!firebaseUser) return;
      if (!reference) {
        setStatus('invalid');
        return;
      }

      try {
        const tx = await verifyCoursePayment(reference);
        if (cancelled) return;

        const courseSlug = (tx.metadata?.course_slug || courseFromQuery || '') as CertificationSlug;
        if (!courseSlug) {
          setStatus('invalid');
          return;
        }

        if (tx.status === 'completed') {
          const uid = appUser?.uid || firebaseUser.uid;
          await grantCourseAccessAfterPayment(uid, courseSlug, tx);
          await refreshAppUser();
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
          return;
        }

        if (tx.status === 'pending' || tx.status === 'processing') {
          setDetails({
            reference: tx.reference,
            amount: tx.amount,
            currency: tx.currency || 'XOF',
            courseSlug,
          });
          setStatus('pending');
          return;
        }

        setStatus('failed');
        setErrorMessage(`Statut: ${tx.status}`);
      } catch (err) {
        if (cancelled) return;
        setStatus('failed');
        setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [reference, firebaseUser, appUser, courseFromQuery]);

  if (!firebaseUser) {
    return <Navigate to={`/login?next=${encodeURIComponent(`/payment/success?reference=${reference}&course=${courseFromQuery || ''}`)}`} replace />;
  }

  const cert = details?.courseSlug
    ? certifications.find(c => c.slug === details.courseSlug)
    : null;

  const labels = lang === 'fr'
    ? {
        verifying: 'Vérification du paiement…',
        verifyingDesc: 'Merci de patienter pendant que nous validons votre transaction.',
        granted: 'Paiement confirmé',
        grantedDesc: 'Votre accès au cours est activé pour 30 jours.',
        pending: 'Paiement en cours',
        pendingDesc: 'Votre paiement est en cours de traitement. Vous recevrez votre accès dès la confirmation.',
        failed: 'Paiement non confirmé',
        failedDesc: "Nous n'avons pas pu confirmer votre paiement. Si le montant a été débité, contactez le support.",
        invalid: 'Référence invalide',
        invalidDesc: 'Aucune référence de paiement valide n\'a été trouvée.',
        access: 'Accéder au cours',
        retry: 'Réessayer la vérification',
        backHome: "Retour à l'accueil",
        reference: 'Référence',
        amount: 'Montant',
        course: 'Cours',
        expiresOn: "Accès jusqu'au",
      }
    : {
        verifying: 'Verifying your payment…',
        verifyingDesc: 'Please wait while we validate your transaction.',
        granted: 'Payment confirmed',
        grantedDesc: 'Your access to the course is active for 30 days.',
        pending: 'Payment pending',
        pendingDesc: 'Your payment is being processed. You will get access as soon as it is confirmed.',
        failed: 'Payment not confirmed',
        failedDesc: 'We could not confirm your payment. If you have been charged, please contact support.',
        invalid: 'Invalid reference',
        invalidDesc: 'No valid payment reference was found.',
        access: 'Open the course',
        retry: 'Retry verification',
        backHome: 'Back to home',
        reference: 'Reference',
        amount: 'Amount',
        course: 'Course',
        expiresOn: 'Access until',
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4 py-10">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-14 h-14 text-primary-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{labels.verifying}</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">{labels.verifyingDesc}</p>
          </>
        )}

        {status === 'granted' && (
          <>
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
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{labels.pending}</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-5">{labels.pendingDesc}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {labels.retry}
            </button>
          </>
        )}

        {(status === 'failed' || status === 'invalid') && (
          <>
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              {status === 'failed' ? labels.failed : labels.invalid}
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
              {status === 'failed' ? labels.failedDesc : labels.invalidDesc}
            </p>
            {errorMessage && (
              <p className="text-xs text-dark-500 dark:text-dark-500 mb-5 font-mono">{errorMessage}</p>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 font-medium text-sm hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
            >
              {labels.backHome}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
