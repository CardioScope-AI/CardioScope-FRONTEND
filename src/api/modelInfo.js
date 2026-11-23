const cvKeys = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'];
const testKeys = [...cvKeys, 'specificity'];
const confusionKeys = ['true_negative', 'false_positive', 'false_negative', 'true_positive'];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isScore(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1);
}

function hasScores(value, keys) {
  return isRecord(value) && keys.every(key => Object.hasOwn(value, key) && isScore(value[key]));
}

export function isModelInfo(value) {
  if (!isRecord(value) || value.schema_version !== 1
      || typeof value.model_version !== 'string' || !value.model_version.trim()
      || !/^[0-9a-f]{64}$/.test(value.artifact_sha256)
      || typeof value.model_name !== 'string' || !value.model_name.trim()
      || typeof value.dataset !== 'string' || !value.dataset.trim()
      || !Array.isArray(value.features) || value.features.length !== 13
      || !value.features.every(name => typeof name === 'string' && name.trim())
      || !isRecord(value.target) || typeof value.target['0'] !== 'string'
      || typeof value.target['1'] !== 'string'
      || !Array.isArray(value.limitations) || value.limitations.length === 0
      || !value.limitations.every(item => typeof item === 'string' && item.trim())) return false;

  const evaluation = value.evaluation;
  if (!isRecord(evaluation)
      || !Number.isInteger(evaluation.train_samples) || evaluation.train_samples < 1
      || !Number.isInteger(evaluation.test_samples) || evaluation.test_samples < 1
      || !Number.isInteger(evaluation.cv_folds) || evaluation.cv_folds < 2
      || !hasScores(evaluation.cv_metrics, cvKeys)
      || !hasScores(evaluation.test_metrics, testKeys)) return false;

  const matrix = evaluation.confusion_matrix;
  return matrix === null || (isRecord(matrix)
    && confusionKeys.every(key => Number.isInteger(matrix[key]) && matrix[key] >= 0)
    && confusionKeys.reduce((sum, key) => sum + matrix[key], 0) === evaluation.test_samples);
}

export class ModelInfoError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ModelInfoError';
    this.status = status;
  }
}

export async function getModelInfo({ signal, timeoutMs = 15000 } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    const response = await fetch('/api/model-info', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      signal: requestSignal,
    });
    if (!response.ok) {
      const messages = {
        401: 'Connectez-vous en tant qu’administrateur pour consulter la fiche du modèle.',
        403: 'Votre session ne permet pas de consulter la fiche du modèle.',
        503: 'La fiche du modèle est indisponible. Réessayez lorsque la release ML sera chargée.',
      };
      throw new ModelInfoError(messages[response.status] ?? 'Impossible de charger la fiche du modèle.', {
        status: response.status,
      });
    }
    const body = await response.json();
    if (!isModelInfo(body)) {
      throw new ModelInfoError('La fiche du modèle a un format inattendu.');
    }
    return body;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new ModelInfoError('Le service met trop de temps à répondre. Réessayez.', { cause: error });
    }
    if (error instanceof ModelInfoError) throw error;
    throw new ModelInfoError('Impossible de contacter le service du modèle.', { cause: error });
  }
}
