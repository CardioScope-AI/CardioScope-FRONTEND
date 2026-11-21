export class AuthError extends Error {
  constructor(message, { status = null, code = null, retryAfter = null, cause } = {}) {
    super(message, { cause });
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export async function getCsrfToken({ signal, timeoutMs = 10000 } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    const response = await fetch('/api/admin/csrf', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
      signal: requestSignal,
    });
    if (!response.ok) {
      if (response.status === 503) {
        throw new AuthError('Le service d’authentification est temporairement indisponible.', {
          status: 503,
          code: 'storage_unavailable',
        });
      }
      throw new AuthError('Impossible d’initialiser la session de connexion.', { status: response.status });
    }
    const data = await response.json();
    if (!data || typeof data.csrf_token !== 'string' || !data.csrf_token) {
      throw new AuthError('Réponse inattendue du serveur.');
    }
    return data.csrf_token;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new AuthError('Le serveur met trop de temps à répondre.', { cause: error });
    }
    if (error instanceof AuthError) throw error;
    throw new AuthError('Service d’authentification inaccessible.', { cause: error });
  }
}

export async function loginAdmin({ username, password }, { signal, csrfToken = null, timeoutMs = 15000 } = {}) {
  const cleanUsername = String(username ?? '').trim();
  const cleanPassword = String(password ?? '');

  if (!cleanUsername || !cleanPassword) {
    throw new AuthError('Veuillez renseigner votre identifiant et votre mot de passe.', { code: 'validation_error' });
  }

  let token = csrfToken;
  if (!token) {
    token = await getCsrfToken({ signal, timeoutMs });
  }

  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({
        username: cleanUsername,
        password: cleanPassword,
      }),
      signal: requestSignal,
    });

    if (!response.ok) {
      let body = null;
      try {
        body = await response.json();
      } catch {
        // Non-JSON response
      }

      const code = body?.error?.code ?? 'unknown_error';
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;

      let message = 'Une erreur est survenue lors de la connexion.';
      if (response.status === 401) {
        message = 'Identifiants incorrects. Vérifiez votre nom d’utilisateur et mot de passe.';
      } else if (response.status === 429) {
        const waitText = retryAfter ? ` Veuillez patienter ${retryAfter} seconde${retryAfter > 1 ? 's' : ''}.` : '';
        message = `Trop de tentatives de connexion échouées.${waitText}`;
      } else if (response.status === 403) {
        message = 'Session de sécurité expirée. Veuillez recharger la page.';
      } else if (response.status === 503) {
        message = 'Le service d’authentification est temporairement indisponible.';
      } else if (response.status === 422) {
        message = 'Identifiant ou mot de passe non conforme.';
      }

      throw new AuthError(message, {
        status: response.status,
        code,
        retryAfter,
      });
    }

    const data = await response.json();
    if (!data || !data.admin) {
      throw new AuthError('Réponse serveur inattendue lors de la connexion.');
    }

    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new AuthError('Délai dépassé lors de la tentative de connexion.', { cause: error });
    }
    if (error instanceof AuthError) throw error;
    throw new AuthError('Erreur de connexion au serveur.', { cause: error });
  }
}
