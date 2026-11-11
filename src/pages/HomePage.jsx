import Button from '../components/ui/Button.jsx';
const steps = [
  ['01', 'Saisir un profil', 'Renseigner des valeurs fictives.'],
  ['02', 'Voir la prédiction', 'Consulter la classe prédite.'],
  ['03', 'Comprendre le modèle', 'Découvrir Random Forest et ses métriques.'],
];
export default function HomePage() {
  return (
    <>
      <section aria-labelledby="accueil-title" className="grid items-center gap-8 rounded-2xl bg-[#fff8fa] p-6 sm:p-8 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <h1 id="accueil-title" className="mt-4 max-w-xl text-3xl font-bold leading-tight sm:text-[2.5rem]">Explorer les données cardiovasculaires</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">Simulez un profil fictif et découvrez comment<br className="hidden xl:block" /> Random Forest produit sa prédiction.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="#simulation">Démarrer une simulation</Button>
            <Button href="#performances" variant="secondary">Voir les performances</Button>
          </div>
        </div>
        <div className="rounded-2xl bg-[#f6e3eb] p-6 sm:p-7">
          <svg viewBox="0 0 300 170" className="w-full" aria-hidden="true" fill="none">
            <defs><pattern id="ecg-grid" width="30" height="29" patternUnits="userSpaceOnUse"><path d="M30 0H0V29" stroke="#e9c5d2" strokeWidth="1" /></pattern></defs>
            <path fill="url(#ecg-grid)" stroke="#e9c5d2" d="M0 15H300V160H0z" />
            <path d="M6 86h58l23-23 29 54 40-80 32 98 28-49h77" stroke="#AE2449" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-4 text-sm font-bold text-brand">Classification avec Random Forest</p>
        </div>
      </section>
      <section aria-label="Les étapes de la simulation" className="mt-7 grid gap-4 md:grid-cols-3">
        {steps.map(([number, title, description]) => (
          <article key={number} className="ui-card">
            <p className="text-xs font-bold text-brand">{number}</p>
            <h2 className="mt-2 text-lg font-bold">{title}</h2>
            <p className="mt-3 text-sm text-muted">{description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
