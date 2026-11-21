import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { getCsrfToken, loginAdmin, fetchAdminSession, logoutAdmin, AuthError } from '../src/api/auth.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('getCsrfToken récupère le jeton CSRF avec credentials include', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/admin/csrf');
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'include');
    return Response.json({ csrf_token: 'fake_token_123', expires_at: '2026-11-21T13:00:00Z' });
  };

  const token = await getCsrfToken();
  assert.equal(token, 'fake_token_123');
});

test('getCsrfToken rejette si la réponse n’a pas le bon format ou renvoie une erreur', async () => {
  globalThis.fetch = async () => new Response('Server Error', { status: 500 });
  await assert.rejects(getCsrfToken(), (err) => err instanceof AuthError && err.status === 500);

  globalThis.fetch = async () => Response.json({ invalid: 'field' });
  await assert.rejects(getCsrfToken(), (err) => err instanceof AuthError && /inattendue|invalide/i.test(err.message));
});

test('loginAdmin refuse les champs vides sans appeler le réseau', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return Response.json({});
  };

  await assert.rejects(loginAdmin({ username: '', password: '' }), (err) => {
    assert.equal(err.code, 'validation_error');
    return true;
  });
  assert.equal(called, false);
});

test('loginAdmin envoie la requête de connexion avec le jeton CSRF et les cookies', async () => {
  let step = 0;
  globalThis.fetch = async (url, options) => {
    if (url === '/api/admin/csrf') {
      step++;
      return Response.json({ csrf_token: 'csrf_xyz_789' });
    }
    if (url === '/api/admin/login') {
      step++;
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers['X-CSRF-Token'], 'csrf_xyz_789');
      assert.equal(options.headers['Content-Type'], 'application/json');
      const body = JSON.parse(options.body);
      assert.equal(body.username, 'admin_ensa');
      assert.equal(body.password, 'secret123');
      return Response.json({
        admin: { id: 'admin-id-1', username: 'admin_ensa' },
        session: { expires_at: '2026-11-21T20:00:00Z', idle_timeout_seconds: 1800 },
      });
    }
    throw new Error('Unknown url ' + url);
  };

  const result = await loginAdmin({ username: 'admin_ensa', password: 'secret123' });
  assert.equal(step, 2);
  assert.equal(result.admin.username, 'admin_ensa');
});

test('loginAdmin gère l’erreur 401 identifiants invalides', async () => {
  globalThis.fetch = async (url) => {
    if (url === '/api/admin/csrf') return Response.json({ csrf_token: 'token' });
    return Response.json(
      { error: { code: 'invalid_credentials', message: 'Identifiants invalides.' } },
      { status: 401 }
    );
  };

  await assert.rejects(
    loginAdmin({ username: 'mauvais_user', password: 'bad' }),
    (err) => err instanceof AuthError && err.status === 401 && /identifiants incorrects/i.test(err.message)
  );
});

test('loginAdmin gère l’erreur 429 rate limit avec Retry-After', async () => {
  globalThis.fetch = async (url) => {
    if (url === '/api/admin/csrf') return Response.json({ csrf_token: 'token' });
    return new Response(
      JSON.stringify({ error: { code: 'rate_limited', message: 'Trop de tentatives.' } }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      }
    );
  };

  await assert.rejects(
    loginAdmin({ username: 'admin', password: 'pwd' }),
    (err) => {
      assert.equal(err.status, 429);
      assert.equal(err.code, 'rate_limited');
      assert.equal(err.retryAfter, 60);
      assert.ok(err.message.includes('60 secondes'));
      return true;
    }
  );
});

test('loginAdmin gère l’erreur 403 CSRF échoué', async () => {
  globalThis.fetch = async (url) => {
    if (url === '/api/admin/csrf') return Response.json({ csrf_token: 'token' });
    return Response.json({ error: { code: 'csrf_failed', message: 'CSRF failed' } }, { status: 403 });
  };

  await assert.rejects(
    loginAdmin({ username: 'admin', password: 'pwd' }),
    (err) => err.status === 403 && err.code === 'csrf_failed'
  );
});

test('loginAdmin gère l’erreur 503 stockage indisponible', async () => {
  globalThis.fetch = async (url) => {
    if (url === '/api/admin/csrf') return Response.json({ csrf_token: 'token' });
    return Response.json({ error: { code: 'storage_unavailable', message: 'DB down' } }, { status: 503 });
  };

  await assert.rejects(
    loginAdmin({ username: 'admin', password: 'pwd' }),
    (err) => err.status === 503 && /temporairement indisponible/i.test(err.message)
  );
});

test('fetchAdminSession renvoie l’identité quand la session est active (200)', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/admin/me');
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'include');
    return Response.json({
      admin: { id: 'admin-id-123', username: 'admin_ensa' },
      session: { expires_at: '2026-11-21T21:00:00Z', idle_timeout_seconds: 1800 },
    });
  };

  const identity = await fetchAdminSession();
  assert.ok(identity);
  assert.equal(identity.admin.username, 'admin_ensa');
});

test('fetchAdminSession renvoie null sans session (401)', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/admin/me');
    return new Response(JSON.stringify({ error: { code: 'unauthenticated' } }), { status: 401 });
  };

  const identity = await fetchAdminSession();
  assert.equal(identity, null);
});

test('fetchAdminSession renvoie null en cas de panne réseau sans lever d’exception', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  const identity = await fetchAdminSession();
  assert.equal(identity, null);
});

test('logoutAdmin appelle POST /admin/logout avec credentials include', async () => {
  let calledLogout = false;
  globalThis.fetch = async (url, options) => {
    if (url === '/api/admin/csrf') {
      return Response.json({ csrf_token: 'csrf_logout_123' });
    }
    if (url === '/api/admin/logout') {
      calledLogout = true;
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers['X-CSRF-Token'], 'csrf_logout_123');
      return new Response(null, { status: 204 });
    }
    throw new Error('Unknown url ' + url);
  };

  await logoutAdmin();
  assert.equal(calledLogout, true);
});

test('logoutAdmin tolère une erreur serveur ou un endpoint absent', async () => {
  globalThis.fetch = async () => new Response('Not Found', { status: 404 });
  await assert.doesNotReject(logoutAdmin());
});
