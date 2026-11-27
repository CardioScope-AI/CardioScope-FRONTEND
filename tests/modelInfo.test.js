import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { getModelInfo, getModelCatalog, ModelInfoError } from '../src/api/modelInfo.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const info = {
  schema_version: 1,
  model_version: 'rf-cleveland-v1',
  artifact_sha256: 'a'.repeat(64),
  model_name: 'RandomForestClassifier',
  dataset: 'UCI Heart Disease / Cleveland',
  features: ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'],
  target: { '0': 'absence', '1': 'présence' },
  evaluation: {
    train_samples: 242,
    test_samples: 61,
    cv_folds: 5,
    cv_metrics: { accuracy: 0, precision: null, recall: 0.8, f1: null, roc_auc: null },
    test_metrics: { accuracy: 0.8689, precision: null, recall: null, f1: null,
      roc_auc: null, specificity: null },
    confusion_matrix: { true_negative: 27, false_positive: 6, false_negative: 2, true_positive: 26 },
  },
  limitations: ['Démonstrateur pédagogique ; pas un diagnostic.'],
};

test('catalogue : charge deux modèles sans confondre version active et comparaison', async () => {
  const xgb = { ...info, model_name: 'XGBClassifier', model_version: 'xgb-cleveland-v1' };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/models');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    return Response.json({ schema_version: 1, active_model_version: info.model_version, models: [info, xgb] });
  };
  const catalog = await getModelCatalog();
  assert.equal(catalog.models.length, 2);
  assert.equal(catalog.active_model_version, 'rf-cleveland-v1');
});

test('catalogue : refuse doublons, modèle actif absent et scores invalides', async () => {
  for (const models of [[info, info], [], [{ ...info, model_version: 'other' }],
    [{ ...info, evaluation: { ...info.evaluation, cv_metrics: { ...info.evaluation.cv_metrics, specificity: 2 } } }]]) {
    globalThis.fetch = async () => Response.json({ schema_version: 1, active_model_version: info.model_version, models });
    await assert.rejects(getModelCatalog(), ModelInfoError);
  }
});

test('catalogue : conserve les statuts 401 et 503', async () => {
  for (const status of [401, 503]) {
    globalThis.fetch = async () => Response.json({}, { status });
    await assert.rejects(getModelCatalog(), error => error.status === status);
  }
});

test('charge la release authentifiée sans confondre zéro et métrique absente', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/model-info');
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Accept, 'application/json');
    return Response.json(info);
  };
  const result = await getModelInfo();
  assert.equal(result.evaluation.cv_metrics.accuracy, 0);
  assert.equal(result.evaluation.cv_metrics.precision, null);
  assert.equal(result.model_version, 'rf-cleveland-v1');
});

test('indique la connexion requise et la release indisponible selon le statut HTTP', async () => {
  for (const status of [401, 503]) {
    globalThis.fetch = async () => Response.json({ error: { message: 'Détail technique non affiché' } }, { status });
    await assert.rejects(getModelInfo(), error => {
      assert.ok(error instanceof ModelInfoError);
      assert.equal(error.status, status);
      assert.ok(!error.message.includes('Détail technique'));
      return true;
    });
  }
});

test('refuse une fiche malformée ou une métrique inventée', async () => {
  for (const body of [
    { ...info, schema_version: 2 },
    { ...info, evaluation: { ...info.evaluation, test_metrics: { ...info.evaluation.test_metrics, accuracy: 1.2 } } },
    { ...info, evaluation: { ...info.evaluation, confusion_matrix: { ...info.evaluation.confusion_matrix, true_negative: 28 } } },
  ]) {
    globalThis.fetch = async () => Response.json(body);
    await assert.rejects(getModelInfo(), error => error instanceof ModelInfoError && /format inattendu/.test(error.message));
  }
});

test('signale une panne réseau et laisse passer une annulation de la page', async () => {
  globalThis.fetch = async () => { throw new TypeError('secret technique'); };
  await assert.rejects(getModelInfo(), error => error instanceof ModelInfoError
    && !error.message.includes('secret technique'));

  const controller = new AbortController();
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const request = getModelInfo({ signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: 'AbortError' });
});
