import { useEffect, useRef, useState } from 'react';
import SimulationResult from '../components/SimulationResult.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import ApiStatus from '../components/ApiStatus.jsx';
import { simulationGroups } from '../data/simulationFields.js';

const emptyProfile = Object.fromEntries(
  simulationGroups.flatMap(group => group.fields.map(field => [field.name, ''])),
);

export default function SimulationPage() {
  const [values, setValues] = useState(() => ({ ...emptyProfile }));
  const [result, setResult] = useState(null);
  const titleRef = useRef(null);
  const restarting = useRef(false);
  useEffect(() => {
    if (!result && restarting.current) {
      titleRef.current?.focus();
      restarting.current = false;
    }
  }, [result]);
  function restart() {
    setValues({ ...emptyProfile });
    restarting.current = true;
    setResult(null);
  }
  function preview(prediction) {
    // Copie des saisies : jamais de prédiction déduite du profil en développement.
    setResult({ prediction, profile: { ...values } });
  }
  function handleChange(event) {
    const { name, value } = event.target;
    // Garder les saisies en texte pour distinguer une valeur vide d’un vrai zéro.
    setValues(previous => ({ ...previous, [name]: value }));
  }
  if (result) {
    return <SimulationResult prediction={result.prediction} profile={result.profile} illustrative onRestart={restart} />;
  }
  return (
    <section aria-labelledby="simulation-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 id="simulation-title" ref={titleRef} tabIndex={-1} className="text-3xl font-bold">Simuler un profil</h1>
          <p className="mt-2 text-sm text-muted">Renseignez les champs ci-dessous avec des valeurs fictives.</p>
        </div>
        <Button variant="secondary" disabled aria-describedby="profile-help">Charger un profil fictif</Button>
      </div>
      <p id="profile-help" className="mt-3 text-xs text-muted">Le chargement des profils fictifs sera ajouté dans une prochaine étape.</p>
      <p id="contract-help" className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand">
        Formulaire en préparation : les règles de saisie et les codes sont à confirmer avec l’équipe. La prédiction avec Random Forest n’est pas encore disponible.
      </p>
      <form className="mt-5" aria-describedby="contract-help simulation-notice" onSubmit={event => event.preventDefault()}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {simulationGroups.map(group => (
            <fieldset key={group.id} className="min-w-0 rounded-xl border border-line bg-surface p-4">
              <legend className="float-left mb-4 w-full text-base font-bold">{group.title}</legend>
              <div className="clear-both space-y-3">
                {group.fields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={handleChange} />)}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p id="simulation-notice" className="text-xs text-muted">Saisies fictives uniquement. Le résultat ne constitue pas un diagnostic.</p>
          <Button type="submit" disabled aria-describedby="contract-help" className="w-full sm:w-auto">Lancer la prédiction</Button>
        </div>
      </form>
      {import.meta.env.DEV && (
        <details className="mt-7 rounded-xl border border-dashed border-brand p-4 text-sm">
          <summary className="cursor-pointer font-medium text-brand">Développement : aperçu du résultat</summary>
          <p className="mt-3 text-muted">Réponses simulées pour vérifier l’affichage. Aucun appel à Random Forest ni à l’API. Les champs vides restent indiqués comme non renseignés.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => preview(0)}>Aperçu classe 0</Button>
            <Button variant="secondary" onClick={() => preview(1)}>Aperçu classe 1</Button>
          </div>
        </details>
      )}
      <details className="mt-7 rounded-xl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-medium">Disponibilité du service</summary>
        <ApiStatus />
      </details>
    </section>
  );
}
