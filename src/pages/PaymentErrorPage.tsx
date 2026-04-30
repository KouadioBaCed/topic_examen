import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';
import { useStore } from '../store/useStore';
import { certifications } from '../data/certifications';
import type { CertificationSlug } from '../types';

export const PaymentErrorPage = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useStore();
  const courseSlug = searchParams.get('course') as CertificationSlug | null;
  const cert = courseSlug ? certifications.find(c => c.slug === courseSlug) : null;

  const labels = lang === 'fr'
    ? {
        title: 'Paiement échoué ou annulé',
        desc: "La transaction n'a pas abouti. Aucun montant n'a été débité, ou le paiement a été annulé.",
        retry: 'Reprendre le paiement',
        back: "Retour à l'accueil",
      }
    : {
        title: 'Payment failed or cancelled',
        desc: 'The transaction did not complete. No amount has been charged, or you cancelled the payment.',
        retry: 'Retry the payment',
        back: 'Back to home',
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4 py-10">
      <div className="card p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{labels.title}</h1>
        <p className="text-sm text-dark-600 dark:text-dark-400 mb-6">{labels.desc}</p>
        <div className="flex flex-col gap-2">
          {cert && (
            <Link
              to={`/topics?cert=${cert.slug}&pay=1`}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
            >
              {labels.retry}
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 font-medium text-sm hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            {labels.back}
          </Link>
        </div>
      </div>
    </div>
  );
};
