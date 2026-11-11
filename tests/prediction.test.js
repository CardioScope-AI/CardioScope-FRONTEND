import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { predict, PredictionError } from '../src/api/prediction.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('envoie le JSON au proxy et accepte les deux classes, dont zéro', async () => {
  for (const prediction of [0, 1]) {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/predict');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.deepEqual(JSON.parse(options.body), { fbs: 0 });
      return Response.json({ prediction });
    };
    assert.deepEqual(await predict({ fbs: 0 }), { prediction });
  }
});

test('refuse une réponse mal formée ou une classe inconnue', async () => {
  for (const body of [null, {}, { prediction: 2 }, { prediction: '1' }]) {
    globalThis.fetch = async () => Response.json(body);
    await assert.rejects(predict({}), PredictionError);
  }
  globalThis.fetch = async () => new Response('<html>Erreur proxy</html>');
  await assert.rejects(predict({}), PredictionError);
});

test('garde le statut HTTP même si le serveur renvoie une erreur non JSON', async () => {
  for (const status of [404, 422, 500, 503]) {
    globalThis.fetch = async () => new Response('Erreur', { status });
    await assert.rejects(predict({}), error => error instanceof PredictionError && error.status === status);
  }
});

test('signale une panne réseau', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(predict({}), PredictionError);
});

function pendingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
}

test('limite le délai de réponse', async () => {
  globalThis.fetch = pendingFetch;
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(predict({}, { timeoutMs: 10 }), /trop de temps/);
  } finally { clearTimeout(keepAlive); }
});

test('propage une annulation demandée par la vue', async () => {
  globalThis.fetch = pendingFetch;
  const controller = new AbortController();
  const result = predict({}, { signal: controller.signal });
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
});
