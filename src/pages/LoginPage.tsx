import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { t } from '../i18n';
import { certifications } from '../data/certifications';

export const LoginPage = () => {
  const { firebaseUser, appUser, loading, login, register } = useAuth();
  const { lang } = useStore();
  const [searchParams] = useSearchParams();
  const certParam = searchParams.get('cert');
  const targetCert = certParam ? certifications.find(c => c.slug === certParam) : null;

  // Where to send the user after login/register: paywall for the requested course, or homepage.
  const postAuthPath = targetCert
    ? `/topics?cert=${targetCert.slug}&pay=1`
    : '/';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clickedTerms, setClickedTerms] = useState(false);
  const [clickedPrivacy, setClickedPrivacy] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!(acceptedTerms && clickedTerms && clickedPrivacy)) {
      setFormError(t(lang, 'mustAcceptTerms'));
      return;
    }
    if (password.length < 6) {
      setFormError(t(lang, 'passwordTooShort'));
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, displayName);
      // Redirection automatique gérée par le <Navigate /> dès que appUser est chargé.
    } catch {
      setFormError(t(lang, 'registerError'));
    } finally {
      setSubmitting(false);
    }
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
              {/* <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" /> */}
            </h1>
          </div>
        </div>

        {targetCert && (
          <div className="mb-4 p-4 rounded-xl bg-primary-500/10 border border-primary-400/30 text-center">
            <p className="text-xs uppercase tracking-wider text-primary-300 font-semibold mb-1">
              {lang === 'fr' ? 'Souscription au cours' : 'Subscribing to'}
            </p>
            <p className="text-white font-bold">
              {targetCert.fullName || targetCert.name}
            </p>
            <p className="text-xs text-primary-200 mt-1">
              {lang === 'fr'
                ? "Créez votre compte puis effectuez le paiement (200 000 FCFA / mois) pour activer l'accès."
                : 'Create your account, then pay (200,000 XOF / month) to activate access.'}
            </p>
          </div>
        )}

        <div className="card p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-dark-100 dark:bg-dark-800 rounded-xl p-1">
            <button
              onClick={() => { setActiveTab('login'); setFormError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
              }`}
            >
              <LogIn className="w-4 h-4" />
              {t(lang, 'login')}
            </button>
            <button
              onClick={() => { setActiveTab('register'); setFormError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {t(lang, 'register')}
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  {t(lang, 'fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="input pl-10 py-2.5"
                    placeholder={t(lang, 'fullNamePlaceholder')}
                  />
                </div>
              </div>
            )}

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
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="text-xs text-dark-600 dark:text-dark-400 cursor-pointer">
                  {t(lang, 'acceptTerms')}{' '}
                  <a href="/terms" target="_blank" onClick={() => setClickedTerms(true)} className={`underline ${clickedTerms ? 'text-green-500' : 'text-primary-500 hover:text-primary-400'}`}>{t(lang, 'termsOfUse')}</a>{' '}
                  {t(lang, 'and')}{' '}
                  <a href="/privacy" target="_blank" onClick={() => setClickedPrivacy(true)} className={`underline ${clickedPrivacy ? 'text-green-500' : 'text-primary-500 hover:text-primary-400'}`}>{t(lang, 'privacyPolicy')}</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (activeTab === 'register' && !(acceptedTerms && clickedTerms && clickedPrivacy))}
              className={`btn-primary w-full py-3 text-sm ${activeTab === 'register' && !(acceptedTerms && clickedTerms && clickedPrivacy) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : activeTab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {t(lang, 'login')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t(lang, 'register')}
                </>
              )}
            </button>
          </form>

          {/* Switch link under form */}
          <div className="mt-4 text-center">
            {activeTab === 'login' ? (
              <button
                onClick={() => { setActiveTab('register'); setFormError(''); }}
                className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
              >
                {t(lang, 'noAccountYet')}
              </button>
            ) : (
              <button
                onClick={() => { setActiveTab('login'); setFormError(''); }}
                className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
              >
                {t(lang, 'alreadyHaveAccount')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
