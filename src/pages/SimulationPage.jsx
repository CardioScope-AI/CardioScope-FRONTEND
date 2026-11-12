import { useEffect, useRef, useState } from 'react';
import { predict } from '../api/prediction.js';
import { validateSimulation } from '../data/validateSimulation.js';
import SimulationResult from '../components/SimulationResult.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import ApiStatus from '../components/ApiStatus.jsx';
import { simulationGroups } from '../data/simulationFields.js';
import { profilsFictifs } from '../data/profils.js';

const emptyProfile = Object.fromEntries(
  simulationGroups.flatMap(group => group.fields.map(field => [field.name, ''])),
);

export default function SimulationPage() {
  const [values, setValues] = useState(() => ({ ...emptyProfile }));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const requestRef = useRef(null);
  const errorRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  useEffect(() => () => { requestRef.current?.abort(); }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const restarting = useRef(false);
  useEffect(() => {
    if (!result && restarting.current) {
      titleRef.current?.focus();
      restarting.current = false;
    }
  }, [result]);
  function restart() {
    setError('');
    setFieldErrors({});
    setValues({ ...emptyProfile });
    setSelectedProfileId('');
    restarting.current = true;
    setResult(null);
  }

  function handleLoadProfile(event) {
    const profileId = event.target.value;
    setSelectedProfileId(profileId);
    const profile = profilsFictifs.find(item => item.id === profileId);
    if (profile) {
      setValues({ ...profile.values });
      setFieldErrors({});
      setError('');
    }
  }

  function preview(prediction) {
    // Copie des saisies : jamais de prédiction déduite du profil en développement.
    setError('');
    setResult({ prediction, profile: { ...values }, illustrative: true });
  }
  function handleChange(event) {
    const { name, value } = event.target;
    // Garder les saisies en texte pour distinguer une valeur vide d’un vrai zéro.
    setValues(previous => ({ ...previous, [name]: value }));
    setSelectedProfileId('');
    setFieldErrors(previous => ({ ...previous, [name]: undefined }));
    setError('');
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (requestRef.current) return;
    setError('');
    setResult(null);
    const { payload, errors } = validateSimulation(values);
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      formRef.current?.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const response = await predict(payload, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setResult({ prediction: response.prediction, profile: { ...payload }, illustrative: false });
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message || 'Prédiction indisponible. Réessayez.');
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  if (result) {
    return <SimulationResult prediction={result.prediction} profile={result.profile} illustrative={result.illustrative} onRestart={restart} />;
  }
  return (
    <section aria-labelledby="simulation-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 id="simulation-title" ref={titleRef} tabIndex={-1} className="text-3xl font-bold">Simuler un profil</h1>
          <p className="mt-2 text-sm text-muted">Renseignez les champs ci-dessous avec des valeurs fictives.</p>
        </div>
        <div className="flex flex-col sm:items-end">
          <label htmlFor="select-profile" className="sr-only">Charger un profil fictif</label>
          <select
            id="select-profile"
            value={selectedProfileId}
            onChange={handleLoadProfile}
            disabled={loading}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-brand focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">Charger un profil fictif…</option>
            {profilsFictifs.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
          {selectedProfileId && (
            <p className="mt-2 max-w-xs text-xs text-muted sm:text-right" role="status">
              {profilsFictifs.find(p => p.id === selectedProfileId)?.description}
            </p>
          )}
        </div>
      </div>
      <p id="contract-help" className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand">
        Tous les champs sont obligatoires. Utilisez uniquement des valeurs fictives.
      </p>
      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="mt-4 rounded-lg border border-brand bg-brand-soft p-4 text-sm text-brand">{error}</p>}
      <form ref={formRef} noValidate className="mt-5" aria-busy={loading} aria-describedby="contract-help simulation-notice" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {simulationGroups.map(group => (
            <fieldset disabled={loading} key={group.id} className="min-w-0 rounded-xl border border-line bg-surface p-4">
              <legend className="float-left mb-4 w-full text-base font-bold">{group.title}</legend>
              <div className="clear-both space-y-3">
                {group.fields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={handleChange} error={fieldErrors[field.name]} />)}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p id="simulation-notice" className="text-xs text-muted">Saisies fictives uniquement. Le résultat ne constitue pas un diagnostic.</p>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? 'Prédiction en cours…' : 'Lancer la prédiction'}</Button>
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">{loading ? 'Prédiction en cours, veuillez patienter.' : ''}</p>
      </form>
      {import.meta.env.DEV && (
        <details className="mt-7 rounded-xl border border-dashed border-brand p-4 text-sm">
          <summary className="cursor-pointer font-medium text-brand">Développement : aperçu du résultat</summary>
          <p className="mt-3 text-muted">Réponses simulées pour vérifier l’affichage. Aucun appel à Random Forest ni à l’API. Les champs vides restent indiqués comme non renseignés.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" disabled={loading} onClick={() => preview(0)}>Aperçu classe 0</Button>
            <Button variant="secondary" disabled={loading} onClick={() => preview(1)}>Aperçu classe 1</Button>
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
