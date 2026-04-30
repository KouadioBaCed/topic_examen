import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { t } from '../i18n';
import { certifications } from '../data/certifications';

export const LoginPage = () => {
  const { firebaseUser, appUser, loading, login } = useAuth();
  const { lang } = useStore();
  const [searchParams] = useSearchParams();
  const certParam = searchParams.get('cert');
  const targetCert = certParam ? certifications.find(c => c.slug === certParam) : null;

  // After login, route to the requested course (paywall opens auto if not subscribed),
  // or to the homepage if no course was specified.
  const postAuthPath = targetCert
    ? `/topics?cert=${targetCert.slug}&pay=1`
    : '/';

  const subscribePath = targetCert
    ? `/subscribe?cert=${targetCert.slug}`
    : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (firebaseUser && appUser) {
    return <Navigate to={postAuthPath} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setFormError(t(lang, 'loginError'));
    } finally {
      setSubmitting(false);
    }
  };

  const labels = lang === 'fr'
    ? {
        noAccount: "Pas encore de compte ?",
        subscribeCta: targetCert ? `Souscrire au cours ${targetCert.name}` : 'Choisir un cours et souscrire',
        subscribeHint: 'Les comptes sont créés au moment du paiement.',
      }
    : {
        noAccount: 'No account yet?',
        subscribeCta: targetCert ? `Subscribe to ${targetCert.name}` : 'Choose a course and subscribe',
        subscribeHint: 'Accounts are created when you complete a payment.',
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo/zouzou_image.png" alt="FinMark" className="w-14 h-14 object-contain" />
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Fin <span className="text-gradient">Mark</span>
            </h1>
          </div>
        </div>

        {targetCert && (
          <div className="mb-4 p-4 rounded-xl bg-primary-500/10 border border-primary-400/30 text-center">
            <p className="text-xs uppercase tracking-wider text-primary-300 font-semibold mb-1">
              {lang === 'fr' ? 'Cours visé' : 'Target course'}
            </p>
            <p className="text-white font-bold">
              {targetCert.fullName || targetCert.name}
            </p>
          </div>
        )}

        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-1 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary-500" />
            {t(lang, 'login')}
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-5">
            {lang === 'fr' ? 'Accédez à votre compte existant.' : 'Access your existing account.'}
          </p>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                {t(lang, 'email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10 py-2.5"
                  placeholder={t(lang, 'emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                {t(lang, 'password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-10 py-2.5"
                  placeholder={t(lang, 'passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t(lang, 'login')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-dark-200 dark:border-dark-700">
            <p className="text-xs text-center text-dark-500 dark:text-dark-400 mb-2">
              {labels.noAccount}
            </p>
            <Link
              to={subscribePath}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold text-sm transition-colors"
            >
              {labels.subscribeCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-center text-dark-500 dark:text-dark-400 mt-2 italic">
              {labels.subscribeHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
