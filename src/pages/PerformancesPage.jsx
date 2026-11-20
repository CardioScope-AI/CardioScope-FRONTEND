const metrics = [
  { label: 'Exactitude', value: '86,9 %', detail: '53 profils correctement classés sur 61.' },
  { label: 'Précision · classe 1', value: '81,3 %', detail: '26 des 32 profils prédits positifs le sont réellement.' },
  { label: 'Sensibilité · classe 1', value: '92,9 %', detail: '26 des 28 profils de la classe 1 sont reconnus.' },
  { label: 'Spécificité · classe 0', value: '81,8 %', detail: '27 des 33 profils de la classe 0 sont reconnus.' },
  { label: 'Score F1 · classe 1', value: '86,7 %', detail: 'Synthèse de la précision et de la sensibilité.' },
  { label: 'Aire sous la courbe ROC', value: '0,9421', detail: 'Mesure la séparation des deux classes sur le test.' },
];

const limitations = [
  { title: 'Un petit dataset historique', text: '303 profils issus de Cleveland. Les résultats ne démontrent pas une généralisation à une autre population ou à un autre établissement.' },
  { title: 'Des erreurs possibles', text: 'Le test comporte 6 faux positifs et 2 faux négatifs. Un résultat 0 n’exclut pas une maladie et un résultat 1 ne la confirme pas.' },
  { title: 'Des performances globales', text: 'Ces scores ne prouvent pas une performance identique selon le sexe ou l’âge. Aucune validation clinique externe n’est présentée.' },
  { title: 'Un modèle qui reste fixe', text: 'Les simulations enregistrées ne réentraînent pas le modèle. Une nouvelle version exige un entraînement et une évaluation séparés avec des données vérifiées.' },
];

export default function PerformancesPage() {
  return (
    <section aria-labelledby="performances-title">
      <div className="rounded-2xl bg-[#fff8fa] p-5 sm:p-8">
        <p className="text-sm font-bold text-brand">Jeu de données et résultats</p>
        <h1 id="performances-title" className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          Données et performances
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          CardioScope explore le jeu Cleveland de la collection UCI Heart Disease.
          Le modèle Random Forest classe les profils en deux catégories : 0 pour
          l’absence et 1 pour la présence de pathologie dans ce jeu de données.
        </p>
      </div>

      <section aria-labelledby="modele-title" className="mt-8">
        <h2 id="modele-title" className="text-2xl font-bold">Le modèle Random Forest</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Une forêt de 100 arbres combine les informations des 13 variables pour classer un profil fictif.
          Elle recherche des associations apprises dans les données ; elle n’établit pas leurs causes.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="ui-card"><h3 className="font-bold">1. Préparer les données</h3><p className="mt-2 text-sm leading-6 text-muted">Le pipeline traite les valeurs manquantes et encode les catégories. Ses réglages sont appris sur l’entraînement.</p></li>
          <li className="ui-card"><h3 className="font-bold">2. Combiner les arbres</h3><p className="mt-2 text-sm leading-6 text-muted">Les 100 arbres analysent les variables. Leurs prédictions sont combinées pour produire la classe finale.</p></li>
          <li className="ui-card"><h3 className="font-bold">3. Interpréter la classe</h3><p className="mt-2 text-sm leading-6 text-muted">0 signifie absence et 1 présence selon les étiquettes du dataset. Ce sont des classes estimées, pas une certitude individuelle.</p></li>
        </ol>
        <p className="mt-4 rounded-lg bg-brand-soft p-4 text-sm font-bold leading-6 text-brand">
          Démonstrateur pédagogique, profils fictifs uniquement. Le résultat n’est pas un diagnostic médical
          ni une estimation du risque à 5 ou 10 ans. Aucune probabilité clinique validée n’est fournie.
        </p>
      </section>

      <section aria-labelledby="donnees-title" className="mt-8">
        <h2 id="donnees-title" className="text-2xl font-bold">Les données utilisées</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="ui-card"><p className="text-sm text-muted">Profils Cleveland</p><p className="mt-2 text-3xl font-bold tabular-nums">303</p></div>
          <div className="ui-card"><p className="text-sm text-muted">Pour l’entraînement</p><p className="mt-2 text-3xl font-bold tabular-nums">242</p></div>
          <div className="ui-card"><p className="text-sm text-muted">Réservés au test final</p><p className="mt-2 text-3xl font-bold tabular-nums">61</p></div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
          Chaque profil comporte 13 variables d’entrée. La cible d’origine,
          <code className="mx-1 rounded bg-surface px-1">num</code>, est regroupée
          en deux classes. Les valeurs manquantes sont traitées dans le pipeline,
          à partir des données d’entraînement.
        </p>
        <a className="mt-3 inline-block text-sm font-bold text-brand underline underline-offset-4"
          href="https://archive.ics.uci.edu/dataset/45/heart+disease" target="_blank" rel="noopener noreferrer">
          Consulter la source UCI Heart Disease
        </a>
      </section>

      <section aria-labelledby="mesures-title" className="mt-10">
        <h2 id="mesures-title" className="text-2xl font-bold">Résultats sur le test réservé</h2>
        <p className="mt-2 max-w-3xl leading-7 text-muted">
          Le modèle final a été entraîné sur les 242 profils d’entraînement,
          puis évalué sur les 61 profils de test gardés à l’écart.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Référence documentaire : release <span className="font-bold">rf-cleveland-v1</span>.
          Ces chiffres décrivent cette release ; ils ne garantissent pas les performances d’un autre modèle.
          La validation croisée à 5 plis utilise seulement les 242 profils d’entraînement et reste distincte de ce test final.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(({ label, value, detail }) => (
            <div key={label} className="ui-card min-w-0">
              <dt className="text-sm font-bold text-muted">{label}</dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-brand">{value}</dd>
              <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="matrice-title" className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="ui-card min-w-0">
          <h2 id="matrice-title" className="text-xl font-bold">Matrice de confusion</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Les lignes indiquent la classe réelle, les colonnes la classe prédite.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[16rem] border-collapse text-center text-sm tabular-nums">
              <caption className="sr-only">Prédictions du modèle sur les 61 profils de test</caption>
              <thead><tr className="border-b border-line">
                <th scope="col" className="p-2 text-left">Classe réelle</th>
                <th scope="col" className="p-2">Prédite 0</th>
                <th scope="col" className="p-2">Prédite 1</th>
              </tr></thead>
              <tbody>
                <tr className="border-b border-line"><th scope="row" className="p-2 text-left">0 · absence</th><td className="bg-surface p-2 font-bold">27</td><td className="p-2 font-bold text-brand">6</td></tr>
                <tr><th scope="row" className="p-2 text-left">1 · présence</th><td className="p-2 font-bold text-brand">2</td><td className="bg-surface p-2 font-bold">26</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Sur ce test, le modèle produit 6 faux positifs et 2 faux négatifs.</p>
        </div>
        <div className="rounded-xl bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-bold">Comment lire ces chiffres ?</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            La sensibilité indique la part des profils de classe 1 reconnus.
            La spécificité indique la part des profils de classe 0 reconnus.
            L’exactitude compte toutes les prédictions correctes.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Ces résultats décrivent un test de 61 profils issus d’un jeu de recherche.
            Ils ne constituent pas une validation clinique ni un diagnostic médical.
          </p>
        </div>
      </section>
      <section aria-labelledby="limites-title" className="mt-10">
        <h2 id="limites-title" className="text-2xl font-bold">Limites à garder en tête</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {limitations.map(({ title, text }) => <article key={title} className="ui-card"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}
        </div>
      </section>
    </section>
  );
}
