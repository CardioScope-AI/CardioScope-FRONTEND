const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class HistoryError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'HistoryError';
    this.status = status;
  }
}

function isDate(value) {
  return typeof value === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function isItem(value) {
  const summary = value?.summary;
  return value && typeof value === 'object' && UUID.test(value.id)
    && isDate(value.created_at) && (value.prediction === 0 || value.prediction === 1)
    && typeof value.model_version === 'string' && value.model_version.trim().length > 0
    && summary && Number.isInteger(summary.age)
    && Number.isFinite(summary.trestbps) && Number.isFinite(summary.chol);
}

function isPage(value, page, pageSize) {
  return value && typeof value === 'object' && Array.isArray(value.items)
    && value.items.every(isItem) && value.items.length <= pageSize
    && value.page === page && value.page_size === pageSize
    && Number.isSafeInteger(value.total) && value.total >= 0;
}
const DETAIL_PROFILE_FIELDS = [
  'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
  'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal',
];

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSimulationDetail(value, expectedId) {
  const profile = value?.profile;

  if (
    !value ||
    typeof value !== 'object' ||
    !UUID.test(value.id) ||
    value.id.toLowerCase() !== expectedId.toLowerCase() ||
    !isDate(value.created_at) ||
    ![0, 1].includes(value.prediction) ||
    typeof value.model_version !== 'string' ||
    value.model_version.trim().length === 0 ||
    typeof value.artifact_sha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(value.artifact_sha256) ||
    !profile ||
    typeof profile !== 'object' ||
    Array.isArray(profile)
  ) {
    return false;
  }

  const hasAllProfileFields = DETAIL_PROFILE_FIELDS.every(
    name => Object.hasOwn(profile, name),
  );

  const hasOnlyProfileFields =
    Object.keys(profile).length === DETAIL_PROFILE_FIELDS.length;

  return hasAllProfileFields && hasOnlyProfileFields
    && Number.isInteger(profile.age)
    && [0, 1].includes(profile.sex)
    && [1, 2, 3, 4].includes(profile.cp)
    && isFiniteNumber(profile.trestbps)
    && isFiniteNumber(profile.chol)
    && [0, 1].includes(profile.fbs)
    && [0, 1, 2].includes(profile.restecg)
    && Number.isInteger(profile.thalach)
    && [0, 1].includes(profile.exang)
    && isFiniteNumber(profile.oldpeak)
    && [1, 2, 3].includes(profile.slope)
    && [0, 1, 2, 3].includes(profile.ca)
    && [3, 6, 7].includes(profile.thal);
}
export async function fetchHistory({ page = 1, pageSize = 20, prediction = '',
  createdFrom = '', createdBefore = '', signal, timeoutMs = 15000 } = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (prediction !== '') params.set('prediction', String(prediction));
  if (createdFrom) params.set('created_from', `${createdFrom}T00:00:00Z`);
  if (createdBefore) params.set('created_before', `${createdBefore}T00:00:00Z`);
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    const response = await fetch(`/api/admin/simulations?${params}`, {
      headers: { Accept: 'application/json' }, credentials: 'same-origin',
      cache: 'no-store', signal: requestSignal,
    });
    if (!response.ok) {
      const messages = {
        401: 'Votre session a expiré ou vous n’êtes pas connecté. Connectez-vous pour consulter l’historique.',
        404: 'La consultation de l’historique n’est pas encore disponible.',
        422: 'Les filtres ont été refusés. Vérifiez les dates choisies.',
        503: 'L’historique est momentanément indisponible. Réessayez plus tard.',
      };
      throw new HistoryError(messages[response.status] ?? 'Impossible de charger l’historique.',
        { status: response.status });
    }
    const data = await response.json();
    if (!isPage(data, page, pageSize)) {
      throw new HistoryError('La réponse de l’historique est invalide. Réessayez plus tard.');
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new HistoryError('Le service met trop de temps à répondre. Réessayez.', { cause: error });
    }
    if (error instanceof HistoryError) throw error;
    throw new HistoryError('Impossible de charger l’historique. Vérifiez la connexion.', { cause: error });
  }
}
export async function fetchSimulationDetail(
  id,
  { signal, timeoutMs = 15000 } = {},
) {
  if (typeof id !== 'string' || !UUID.test(id)) {
    throw new HistoryError(
      'L’identifiant de la simulation est invalide.',
      { status: 422 },
    );
  }

  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  try {
    const response = await fetch(
      `/api/admin/simulations/${encodeURIComponent(id)}`,
      {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: requestSignal,
      },
    );

    if (!response.ok) {
      const messages = {
        401: 'Votre session a expiré ou vous n’êtes pas connecté. Connectez-vous pour consulter le détail.',
        404: 'Cette simulation est introuvable.',
        422: 'La demande de détail a été refusée.',
        503: 'Le détail est momentanément indisponible. Réessayez plus tard.',
      };

      throw new HistoryError(
        messages[response.status] ?? 'Impossible de charger le détail de la simulation.',
        { status: response.status },
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new HistoryError(
        'La réponse reçue pour le détail est invalide.',
        { cause: error },
      );
    }

    if (!isSimulationDetail(data, id)) {
      throw new HistoryError(
        'Les informations reçues pour cette simulation sont invalides.',
      );
    }

    return data;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    if (timeout.aborted) {
      throw new HistoryError(
        'Le service met trop de temps à répondre. Réessayez.',
        { cause: error },
      );
    }

    if (error instanceof HistoryError) {
      throw error;
    }

    throw new HistoryError(
      'Impossible de charger le détail. Vérifiez votre connexion.',
      { cause: error },
    );
  }
}
