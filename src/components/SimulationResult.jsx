import { useEffect, useRef } from 'react';
import Button from './ui/Button.jsx';
import { simulationGroups } from '../data/simulationFields.js';

const labels = { 0: 'absence', 1: 'présence' };

export function formatProfileValue(field, value) {
  if (value === '' || value === null || value === undefined) return 'Non renseigné';
  if (field.options) {
    return field.options.find(([code]) => String(code) === String(value))?.[1] ?? 'Valeur non reconnue';
  }
  const units = { age: 'ans', trestbps: 'mmHg', chol: 'mg/dL', thalach: 'bpm' };
  return units[field.name] ? `${value} ${units[field.name]}` : String(value);
}

export default function SimulationResult({ prediction, profile, illustrative = false, onRestart }) {
  const titleRef = useRef(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  const valid = prediction === 0 || prediction === 1;
  const fields = simulationGroups.flatMap(group => group.fields);
  return (
    <section aria-labelledby="result-title">
      <h1 id="result-title" ref={titleRef} tabIndex={-1} className="text-3xl font-bold">Résultat de la simulation</h1>
      <p className="mt-2 text-sm text-muted">{illustrative ? 'Aperçu de développement · Réponse simulée, aucun modèle appelé' : 'Classification du profil fictif avec Random Forest'}</p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="ui-card p-6 sm:p-7">
          <p className="inline-block rounded-lg bg-brand-soft px-3 py-2 text-xs font-bold uppercase text-brand">{illustrative ? 'Résultat illustratif' : 'Résultat du modèle'}</p>
          {valid ? (
            <>
              <h2 className="mt-4 text-3xl font-bold">Classe prédite {prediction}</h2>
              <p className="mt-3 max-w-lg leading-7 text-muted">{illustrative ? 'Cet aperçu illustre la catégorie' : 'Le modèle classe ce profil dans la catégorie'} « {labels[prediction]} » de maladie dans le jeu de données.</p>
            </>
          ) : (
            <p role="alert" className="mt-4 font-bold">Résultat indisponible : la classe reçue n’est pas reconnue.</p>
          )}
          <p className="mt-7 rounded-lg bg-brand-soft p-4 text-sm font-bold text-brand">Résultat pédagogique. Ceci ne constitue pas un diagnostic médical.</p>
        </div>
        <aside aria-labelledby="summary-title" className="rounded-xl bg-surface p-6">
          <h2 id="summary-title" className="text-lg font-bold">Récapitulatif</h2>
          <dl className="mt-3">
            {fields.filter(field => ['age', 'trestbps', 'chol'].includes(field.name)).map(field => (
              <div key={field.name} className="flex flex-wrap justify-between gap-2 border-b border-line py-4 text-sm">
                <dt className="text-muted">{field.label}</dt>
                <dd className="font-bold">{formatProfileValue(field, profile[field.name])}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted">{illustrative ? 'Extrait des saisies de l’aperçu, non envoyées à l’API' : 'Extrait du profil fictif envoyé'}</p>
        </aside>
      </div>
      <div className="mt-7 flex flex-col gap-4 sm:flex-row">
        <Button onClick={onRestart}>Nouvelle simulation</Button>
        <Button href="#performances" variant="secondary">Voir les performances</Button>
      </div>
      <details className="mt-6 rounded-xl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-medium">Voir le profil complet</summary>
        <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {fields.map(field => (
            <div key={field.name} className="border-b border-line py-3">
              <dt className="text-muted">{field.label}</dt>
              <dd className="mt-1 font-medium">{formatProfileValue(field, profile[field.name])}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
