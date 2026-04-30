import { useState } from 'react';
import { X, Loader2, CreditCard, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Certification, CertificationSlug } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../store/useStore';
import {
  COURSE_PRICE_XOF,
  createCoursePayment,
  formatPriceXof,
  isSafeRedirectUrl,
  PaymentApiError,
} from '../../services/payment';

interface PaymentModalProps {
  certification: Certification;
  onClose: () => void;
}

export const PaymentModal = ({ certification, onClose }: PaymentModalProps) => {
  const { appUser } = useAuth();
  const { lang } = useStore();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = lang === 'fr'
    ? {
        title: 'Souscrire à ce cours',
        subtitle: 'Accès complet pendant 1 mois',
        priceLabel: 'Montant',
        duration: 'Durée',
        durationValue: '1 mois (30 jours)',
        phoneLabel: 'Numéro de téléphone (optionnel)',
        phonePlaceholder: '+225 0700000000',
        phoneHint: 'Vous pourrez aussi le saisir sur la page GeniusPay.',
        secureNote: 'Vous serez redirigé vers GeniusPay pour choisir votre moyen de paiement (Wave, Orange Money, MTN, Moov, carte bancaire…) et finaliser le paiement en toute sécurité.',
        cta: 'Continuer vers le paiement',
        ctaLoading: 'Création du paiement…',
        cancel: 'Annuler',
        loginRequired: 'Vous devez être connecté pour effectuer un paiement.',
        invalidPhone: 'Veuillez saisir un numéro de téléphone valide.',
        defaultError: "Impossible d'initier le paiement. Réessayez dans un instant.",
      }
    : {
        title: 'Subscribe to this course',
        subtitle: 'Full access for 1 month',
        priceLabel: 'Amount',
        duration: 'Duration',
        durationValue: '1 month (30 days)',
        phoneLabel: 'Phone number (optional)',
        phonePlaceholder: '+225 0700000000',
        phoneHint: 'You can also enter it on the GeniusPay page.',
        secureNote: 'You will be redirected to GeniusPay to choose your payment method (Wave, Orange Money, MTN, Moov, bank card…) and complete the payment securely.',
        cta: 'Continue to payment',
        ctaLoading: 'Creating payment…',
        cancel: 'Cancel',
        loginRequired: 'You must be signed in to pay.',
        invalidPhone: 'Please enter a valid phone number.',
        defaultError: 'Unable to initiate payment. Try again in a moment.',
      };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!appUser) {
      setError(labels.loginRequired);
      return;
    }
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^\+?\d[\d\s.-]{6,}$/.test(trimmedPhone)) {
      setError(labels.invalidPhone);
      return;
    }
    setSubmitting(true);
    try {
      const res = await createCoursePayment({
        courseSlug: certification.slug as CertificationSlug,
        courseName: certification.fullName || certification.name,
        uid: appUser.uid,
        email: appUser.email,
        displayName: appUser.displayName,
        phone: trimmedPhone || undefined,
      });
      sessionStorage.setItem(
        `payment:${res.reference}`,
        JSON.stringify({ courseSlug: certification.slug, uid: appUser.uid }),
      );
      const target = res.checkout_url || res.payment_url;
      if (!target || !isSafeRedirectUrl(target)) {
        throw new Error('Unsafe or missing redirect URL');
      }
      window.location.href = target;
    } catch (err) {
      const message = err instanceof PaymentApiError ? err.message : labels.defaultError;
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-900 shadow-2xl border border-dark-200 dark:border-dark-800 overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label={labels.cancel}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{labels.title}</h2>
              <p className="text-xs text-white/80">{labels.subtitle}</p>
            </div>
          </div>
          <p className="text-sm font-semibold">{certification.fullName || certification.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.priceLabel}</p>
              <p className="text-lg font-bold text-dark-900 dark:text-white">{formatPriceXof(COURSE_PRICE_XOF)}</p>
            </div>
            <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.duration}</p>
              <p className="text-lg font-bold text-dark-900 dark:text-white">{labels.durationValue}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              {labels.phoneLabel}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={labels.phonePlaceholder}
                inputMode="tel"
                autoComplete="tel"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-dark-500 dark:text-dark-400">{labels.phoneHint}</p>
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

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 font-medium text-sm hover:bg-dark-50 dark:hover:bg-dark-800 disabled:opacity-50 transition-colors"
            >
              {labels.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.ctaLoading}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {labels.cta}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
