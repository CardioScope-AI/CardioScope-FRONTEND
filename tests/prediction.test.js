import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { predict, PredictionError } from '../src/api/prediction.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchWithCsrf(predictionHandler) {
  globalThis.fetch = async (url, options = {}) => {
    if (url === '/api/admin/csrf') {
      assert.equal(options.method, 'GET');
      assert.equal(options.credentials, 'include');
      return Response.json({ csrf_token: 'test-csrf-token' });
    }

    return predictionHandler(url, options);
  };
}

test('envoie le JSON et le jeton CSRF, et accepte les deux classes', async () => {
  for (const prediction of [0, 1]) {
    mockFetchWithCsrf(async (url, options) => {
      assert.equal(url, '/api/predict');
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'same-origin');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.equal(options.headers['X-CSRF-Token'], 'test-csrf-token');
      assert.deepEqual(JSON.parse(options.body), { fbs: 0 });

      return Response.json({ prediction });
    });

    assert.deepEqual(await predict({ fbs: 0 }), { prediction });
  }
});

test('refuse une réponse mal formée ou une classe inconnue', async () => {
  for (const body of [null, {}, { prediction: 2 }, { prediction: '1' }]) {
    mockFetchWithCsrf(async () => Response.json(body));
    await assert.rejects(predict({}), PredictionError);
  }

  mockFetchWithCsrf(async () => new Response('<html>Erreur proxy</html>'));
  await assert.rejects(predict({}), PredictionError);
});

test('garde le statut HTTP même si le serveur renvoie une erreur non JSON', async () => {
  for (const status of [401, 403, 404, 422, 500, 503]) {
    mockFetchWithCsrf(async () => new Response('Erreur', { status }));

    await assert.rejects(
      predict({}),
      error => error instanceof PredictionError && error.status === status,
    );
  }
});

test('signale une panne réseau', async () => {
  mockFetchWithCsrf(async () => {
    throw new TypeError('Failed to fetch');
  });

  await assert.rejects(predict({}), PredictionError);
});

test('associe les erreurs 422 aux champs connus sans exposer les valeurs reçues', async () => {
  mockFetchWithCsrf(async () => Response.json({
    error: {
      code: 'validation_error',
      fields: [
        { location: ['body', 'age'], message: 'SECRET valeur technique' },
        { location: ['body', 'chol'], message: 'Autre erreur' },
        { location: ['body', '__proto__'], message: 'Ignorer' },
        { location: ['query', 'sex'], message: 'Ignorer' },
        { location: ['body', 'unknown'], message: 'Ignorer' },
        null,
      ],
    },
  }, { status: 422 }));

  await assert.rejects(predict({}), error => {
    assert.equal(error.status, 422);
    assert.deepEqual(Object.keys(error.fieldErrors), ['age', 'chol']);
    assert.ok(!JSON.stringify(error.fieldErrors).includes('SECRET'));
    return true;
  });
});

test('garde une erreur globale si aucun champ utilisable n’est fourni', async () => {
  const fieldCases = [
    null,
    'invalid',
    [],
    [{ location: ['body'] }],
    [{ location: ['body', 'unknown'] }],
  ];

  for (const fields of fieldCases) {
    mockFetchWithCsrf(async () => Response.json(
      { error: { fields } },
      { status: 422 },
    ));

    await assert.rejects(
      predict({}),
      error => error.status === 422 && Object.keys(error.fieldErrors).length === 0,
    );
  }

  mockFetchWithCsrf(async () => Response.json(
    { error: { fields: [{ location: ['body', 'age'] }] } },
    { status: 503 },
  ));

  await assert.rejects(
    predict({}),
    error => error.status === 503 && Object.keys(error.fieldErrors).length === 0,
  );
});

function pendingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
    } else {
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
      });
    }
  });
}

test('limite le délai de réponse', async () => {
  mockFetchWithCsrf(pendingFetch);

  const keepAlive = setTimeout(() => {}, 1000);

  try {
    await assert.rejects(predict({}, { timeoutMs: 10 }), /trop de temps/);
  } finally {
    clearTimeout(keepAlive);
  }
});

test('propage une annulation demandée par la vue', async () => {
  mockFetchWithCsrf(pendingFetch);

  const controller = new AbortController();
  const result = predict({}, { signal: controller.signal });
  controller.abort();

  await assert.rejects(result, { name: 'AbortError' });
});