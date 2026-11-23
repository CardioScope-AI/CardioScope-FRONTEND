import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { fetchHistory, HistoryError } from '../src/api/history.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const item = {
  id: '5381f57e-aabc-4635-a3b8-52264d1c4795', created_at: '2026-11-20T12:00:00Z',
  prediction: 0, model_version: 'release-test',
  summary: { age: 63, trestbps: 145, chol: 233 },
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
