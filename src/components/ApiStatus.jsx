import { useCallback, useEffect, useRef, useState } from 'react';
import Button from './ui/Button.jsx';

export default function ApiStatus() {
  const [message, setMessage] = useState('Vérification de l’API…');
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(null);

  const checkHealth = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setMessage('Vérification de l’API…');
    try {
      const response = await fetch('/api/health', { signal: controller.signal });
      const body = await response.json();
      if (controller.signal.aborted) return;
      if (response.status === 503 && body.model_ready === false) {
        setMessage('API accessible · modèle non disponible (503 attendu).');
      } else if (response.ok && body.model_ready === true) {
        setMessage('API accessible · modèle prêt. Contrat de simulation à valider.');
      } else {
        setMessage(`Réponse API inattendue (${response.status}).`);
      }
    } catch {
      if (!controller.signal.aborted) {
        setMessage('API inaccessible. Vérifiez le démarrage du backend et le proxy.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    return () => requestRef.current?.abort();
  }, [checkHealth]);

  return (
    <div className="mt-6" aria-busy={loading}>
      <Button variant="secondary" onClick={() => checkHealth()} disabled={loading} id="check-health">
        {loading ? 'Vérification…' : 'Vérifier la disponibilité'}
      </Button>
      <p id="health" role="status" aria-live="polite" className="mt-4">{message}</p>
    </div>
  );
}
