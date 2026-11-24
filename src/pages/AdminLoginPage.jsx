import { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import { loginAdmin, AuthError } from '../api/auth.js';

export default function AdminLoginPage({ onLoginSuccess, sessionExpired = false }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Décompte automatique en cas de limitation de tentatives
  useEffect(() => {
    if (retryCountdown <= 0) return undefined;
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || retryCountdown > 0) return;

    if (!username.trim()) {
      setError('Veuillez saisir votre nom d’utilisateur.');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await loginAdmin({ username, password });
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(data);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 429 && err.retryAfter) {
          setRetryCountdown(err.retryAfter);
        }
        setError(err.message);
      } else {
        setError('Impossible d’effectuer la connexion. Vérifiez la disponibilité du serveur.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[65vh] items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Carte de connexion principale */}
        <div className="ui-card shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">Connexion</h1>
            <p className="mt-1 text-xs text-muted">
              Veuillez vous authentifier pour accéder à l'application CardioScope.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {sessionExpired && !error && (
              <div
                role="alert"
                className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
              >
                <div className="flex items-start gap-2.5">
                  <svg className="mt-0.5 size-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  <p className="font-semibold">Votre session a expiré. Veuillez vous reconnecter.</p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800"
              >
                <div className="flex items-start gap-2.5">
                  <svg className="mt-0.5 size-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                    {retryCountdown > 0 && (
                      <p className="mt-1 font-mono text-[11px] text-red-700">
                        Réessai autorisé dans : {retryCountdown}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="admin-username" className="block text-xs font-bold text-ink">
                Identifiant
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting || retryCountdown > 0}
                className="ui-field mt-1.5 min-h-11 text-sm disabled:bg-surface disabled:opacity-60"
                placeholder="Entrez votre identifiant"
                aria-invalid={error && !username.trim() ? 'true' : undefined}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-xs font-bold text-ink">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[11px] text-muted hover:text-brand"
                  tabIndex={0}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting || retryCountdown > 0}
                  className="ui-field min-h-11 text-sm disabled:bg-surface disabled:opacity-60"
                  placeholder="••••••••••••"
                  aria-invalid={error && !password ? 'true' : undefined}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || retryCountdown > 0}
              >
                {submitting
                  ? 'Connexion en cours...'
                  : retryCountdown > 0
                  ? `Patienter (${retryCountdown}s)`
                  : 'Se connecter'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
