import ApiStatus from '../components/ApiStatus.jsx';
export default function SimulationPage() {
  return (
    <section aria-labelledby="simulation-title">
      <h1 id="simulation-title" className="text-3xl font-bold">Simuler un profil</h1>
      <p className="mt-3 text-muted">Renseignez un profil fictif pour explorer la classification avec Random Forest.</p>
      <div className="ui-card mt-6">
        <p className="text-muted">Le formulaire sera disponible après validation du contrat API et intégration du pipeline.</p>
        <ApiStatus />
      </div>
      <p className="mt-5 rounded-xl bg-brand-soft p-4 text-sm text-brand">Saisies fictives uniquement. Le résultat ne constitue pas un diagnostic.</p>
    </section>
  );
}
