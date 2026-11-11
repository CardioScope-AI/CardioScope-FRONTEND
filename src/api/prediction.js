// Adaptateur provisoire fondé sur le brouillon contrat-api.md.
// Brouillon accepté comme contrat de travail ; validation réelle backend encore à effectuer.
export class PredictionError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'PredictionError';
    this.status = status;
  }
}

export async function predict(payload, { signal, timeoutMs = 15000 } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response;
  try {
    response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: requestSignal,
    });
    if (!response.ok) {
      const messages = {
        404: 'Le service de prédiction n’est pas encore disponible.',
        422: 'Les données ont été refusées. Vérifiez les valeurs saisies.',
        503: 'Le modèle est indisponible. Réessayez plus tard.',
      };
      throw new PredictionError(
        messages[response.status] ?? 'Prédiction indisponible. Réessayez.',
        { status: response.status },
      );
    }
    const body = await response.json();
    if (body === null || typeof body !== 'object'
        || (body.prediction !== 0 && body.prediction !== 1)) {
      throw new PredictionError('La réponse du service ne contient pas une classe valide.');
    }
    return { prediction: body.prediction };
  } catch (error) {
    // Une annulation par la vue doit rester silencieuse pour l’appelant.
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new PredictionError('Le service met trop de temps à répondre. Réessayez.', { cause: error });
    }
    if (error instanceof PredictionError) throw error;
    throw new PredictionError('Prédiction indisponible. Réessayez.', { cause: error });
  }
}
