import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  fetchHistory,
  fetchSimulationDetail,
  HistoryError,
} from '../src/api/history.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const item = {
  id: '5381f57e-aabc-4635-a3b8-52264d1c4795', created_at: '2026-11-20T12:00:00Z',
  prediction: 0, model_version: 'release-test',
  summary: { age: 63, trestbps: 145, chol: 233 },
};
const detail = {
  ...item,
  artifact_sha256: 'a'.repeat(64),
  profile: {
    age: 63,
    sex: 1,
    cp: 1,
    trestbps: 145,
    chol: 233,
    fbs: 1,
    restecg: 2,
    thalach: 150,
    exang: 0,
    oldpeak: 2.3,
    slope: 3,
    ca: 0,
    thal: 6,
  },
};

test('sends contract filters and reads the matching page without a token', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ items: [item], page: 2, page_size: 20, total: 21 }) };
  };
  const data = await fetchHistory({ page: 2, prediction: '0',
    createdFrom: '2026-11-19', createdBefore: '2026-11-21' });
  const url = new URL(request.url, 'http://localhost');
  assert.equal(url.pathname, '/api/admin/simulations');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('prediction'), '0');
  assert.equal(url.searchParams.get('created_from'), '2026-11-19T00:00:00Z');
  assert.equal(url.searchParams.get('created_before'), '2026-11-21T00:00:00Z');
  assert.equal(request.options.credentials, 'same-origin');
  assert.equal(request.options.cache, 'no-store');
  assert.equal(data.items[0].prediction, 0);
});

test('handles expired session and unavailable storage without showing server internals', async () => {
  for (const status of [401, 503]) {
    globalThis.fetch = async () => ({ ok: false, status,
      json: async () => ({ error: { message: 'private database path' } }) });
    await assert.rejects(fetchHistory(), error => {
      assert.ok(error instanceof HistoryError);
      assert.equal(error.status, status);
      assert.doesNotMatch(error.message, /private/);
      return true;
    });
  }
});

test('rejects malformed or contradictory pagination and summary data', async () => {
  for (const body of [
    { items: [item], page: 1, page_size: 20, total: -1 },
    { items: [{ ...item, summary: { ...item.summary, chol: '233' } }], page: 1, page_size: 20, total: 1 },
    { items: [item], page: 2, page_size: 20, total: 1 },
  ]) {
    globalThis.fetch = async () => ({ ok: true, json: async () => body });
    await assert.rejects(fetchHistory(), HistoryError);
  }
});

test('surfaces network errors and lets the view silently cancel requests', async () => {
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  await assert.rejects(fetchHistory(), HistoryError);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetchHistory({ signal: controller.signal }), TypeError);
});
test('fetches and validates one simulation detail', async () => {
  let request;

  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => detail };
  };

  const result = await fetchSimulationDetail(detail.id);
  const url = new URL(request.url, 'http://localhost');

  assert.equal(url.pathname, `/api/admin/simulations/${detail.id}`);
  assert.equal(request.options.headers.Accept, 'application/json');
  assert.equal(request.options.credentials, 'same-origin');
  assert.equal(request.options.cache, 'no-store');
  assert.deepEqual(result, detail);
});

test('rejects an invalid simulation id without making a request', async () => {
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return { ok: true, json: async () => detail };
  };

  await assert.rejects(
    fetchSimulationDetail('not-a-uuid'),
    error => error instanceof HistoryError && error.status === 422,
  );
  assert.equal(requestCount, 0);
});

test('rejects malformed detail responses', async () => {
  const invalidDetails = [
    { ...detail, id: 'not-a-uuid' },
    { ...detail, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    { ...detail, artifact_sha256: 'wrong-hash' },
    { ...detail, profile: { ...detail.profile, age: '63' } },
    { ...detail, profile: { ...detail.profile, thal: 5 } },
    { ...detail, profile: { age: 63 } },
  ];

  for (const body of invalidDetails) {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => body,
    });

    await assert.rejects(fetchSimulationDetail(detail.id), HistoryError);
  }
});

test('maps detail HTTP errors to safe messages', async () => {
  for (const status of [401, 404, 422, 503]) {
    globalThis.fetch = async () => ({
      ok: false,
      status,
      json: async () => ({
        error: { message: 'private database details' },
      }),
    });

    await assert.rejects(
      fetchSimulationDetail(detail.id),
      error => {
        assert.ok(error instanceof HistoryError);
        assert.equal(error.status, status);
        assert.doesNotMatch(error.message, /private database details/);
        return true;
      },
    );
  }
});

test('handles network errors, timeouts, and cancelled detail requests', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('offline');
  };
  await assert.rejects(fetchSimulationDetail(detail.id), HistoryError);

  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });

  await assert.rejects(
    fetchSimulationDetail(detail.id, { timeoutMs: 1 }),
    error => error instanceof HistoryError && /trop de temps/.test(error.message),
  );

  const controller = new AbortController();
  controller.abort();

  globalThis.fetch = async () => {
    throw new DOMException('Aborted', 'AbortError');
  };

  await assert.rejects(
    fetchSimulationDetail(detail.id, { signal: controller.signal }),
    { name: 'AbortError' },
  );
});