import { useCallback, useEffect, useRef, useState } from 'react';

export default function App() {
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
    <>
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center"><a href="#" className="font-bold text-2xl">♡ CardioScope</a><span className="text-sm">Projet étudiant · 2026</span></header>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <p className="uppercase tracking-widest text-teal-700 text-sm">Comprendre · Explorer · Simuler</p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight max-w-3xl mt-6">Les données au cœur de la prévention.</h1>
        <p className="text-lg max-w-xl mt-8 text-slate-600">Un espace pédagogique pour explorer la prédiction du risque cardiaque avec le machine learning.</p>
        <a href="#simulation" className="inline-block mt-8 bg-teal-800 text-white px-6 py-3 rounded-xl">Accéder à la simulation →</a>
        <section id="simulation" className="mt-20 bg-white border border-teal-100 rounded-2xl p-8 scroll-mt-6" aria-labelledby="simulation-title">
          <h2 id="simulation-title" className="text-2xl font-semibold">Simulation</h2>
          <p className="mt-3 text-slate-600">Le formulaire sera disponible après validation du contrat API et intégration du pipeline.</p>
          <button onClick={() => checkHealth()} disabled={loading} id="check-health" className="mt-6 border border-teal-800 rounded-lg px-4 py-2">Vérifier la disponibilité</button>
          <p id="health" role="status" aria-live="polite" className="mt-4">{message}</p>
        </section>
        <p className="mt-6 text-sm text-slate-500">Démonstrateur étudiant. Aucun diagnostic médical n’est fourni.</p>
      </main>
    </>
  );
}
