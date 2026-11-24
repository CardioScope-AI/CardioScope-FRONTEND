import { useEffect, useState } from 'react';
import { getModelInfo } from '../api/modelInfo.js';

const scoreLabels = [
  ['accuracy', 'Exactitude'],
  ['precision', 'Précision · classe 1'],
  ['recall', 'Sensibilité · classe 1'],
  ['specificity', 'Spécificité · classe 0'],
  ['f1', 'Score F1 · classe 1'],
  ['roc_auc', 'Aire sous la courbe ROC'],
];

const percent = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

function formatScore(value) {
  return value === null ? 'Non fourni' : percent.format(value);
}

function ScoreSection({ title, description, scores }) {
  return (
    <section className="mt-10" aria-label={title}>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scoreLabels.filter(([key]) => Object.hasOwn(scores, key)).map(([key, label]) => (
          <div key={key} className="ui-card min-w-0">
            <dt className="text-sm font-bold text-muted">{label}</dt>
            <dd className="mt-2 text-2xl font-bold tabular-nums text-brand">{formatScore(scores[key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ConfusionMatrix({ matrix, testSamples, target }) {
  return (
    <section className="mt-10" aria-labelledby="matrice-title">
      <h3 id="matrice-title" className="text-xl font-bold">Matrice de confusion</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Les lignes indiquent la classe réelle et les colonnes la classe prédite, sur {testSamples} profils de test.
      </p>
      {matrix === null ? (
        <p className="mt-4 rounded-lg bg-surface p-4 text-muted">Matrice non fournie pour cette release.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full max-w-xl min-w-[16rem] border-collapse text-center text-sm tabular-nums">
            <caption className="sr-only">Matrice de confusion sur le test réservé</caption>
            <thead><tr className="border-b border-line">
              <th scope="col" className="p-2 text-left">Classe réelle</th>
              <th scope="col" className="p-2">Prédite 0</th>
              <th scope="col" className="p-2">Prédite 1</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-line">
                <th scope="row" className="p-2 text-left">0 · {target['0']}</th>
                <td className="bg-surface p-2 font-bold">{matrix.true_negative}</td>
                <td className="p-2 font-bold text-brand">{matrix.false_positive}</td>
              </tr>
              <tr>
                <th scope="row" className="p-2 text-left">1 · {target['1']}</th>
                <td className="p-2 font-bold text-brand">{matrix.false_negative}</td>
                <td className="bg-surface p-2 font-bold">{matrix.true_positive}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ModelInfoView({ info }) {
  const { evaluation } = info;
  const total = evaluation.train_samples + evaluation.test_samples;
  return (
    <div>
      <section className="mt-8" aria-labelledby="release-title">
        <h2 id="release-title" className="text-2xl font-bold">Release chargée</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="ui-card"><dt className="text-sm text-muted">Version</dt><dd className="mt-2 font-bold">{info.model_version}</dd></div>
          <div className="ui-card"><dt className="text-sm text-muted">Modèle</dt><dd className="mt-2 font-bold">{info.model_name}</dd></div>
          <div className="ui-card sm:col-span-2"><dt className="text-sm text-muted">Jeu de données</dt><dd className="mt-2 font-bold">{info.dataset}</dd></div>
          <div className="ui-card sm:col-span-2">
            <dt className="text-sm text-muted">Empreinte SHA-256 de l’artefact</dt>
            <dd className="mt-2 break-all font-mono text-xs">{info.artifact_sha256}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="donnees-title">
        <h2 id="donnees-title" className="text-2xl font-bold">Données et classes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="ui-card"><p className="text-sm text-muted">Profils au total</p><p className="mt-2 text-3xl font-bold tabular-nums">{total}</p></div>
          <div className="ui-card"><p className="text-sm text-muted">Entraînement</p><p className="mt-2 text-3xl font-bold tabular-nums">{evaluation.train_samples}</p></div>
          <div className="ui-card"><p className="text-sm text-muted">Test réservé</p><p className="mt-2 text-3xl font-bold tabular-nums">{evaluation.test_samples}</p></div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          {info.features.length} variables d’entrée · Classe 0 : {info.target['0']} · Classe 1 : {info.target['1']}.
        </p>
        <details className="mt-3 rounded-lg border border-line p-4">
          <summary className="cursor-pointer font-bold">Voir les variables d’entrée</summary>
          <p className="mt-3 break-words font-mono text-sm">{info.features.join(', ')}</p>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="mesures-title">
        <h2 id="mesures-title" className="text-2xl font-bold">Évaluation du modèle</h2>
        <p className="mt-2 max-w-3xl leading-7 text-muted">
          Les scores de validation croisée et ceux du test réservé décrivent deux étapes distinctes.
          Une métrique absente est indiquée « Non fourni ».
        </p>
        <ScoreSection
          title="Validation croisée sur l’entraînement"
          description={evaluation.cv_folds + ' plis, calculés uniquement sur les profils d’entraînement.'}
          scores={evaluation.cv_metrics}
        />
        <ScoreSection
          title="Test final réservé"
          description={evaluation.test_samples + ' profils gardés à l’écart de l’entraînement.'}
          scores={evaluation.test_metrics}
        />
        <ConfusionMatrix matrix={evaluation.confusion_matrix} testSamples={evaluation.test_samples} target={info.target} />
      </section>

      <section className="mt-10" aria-labelledby="limites-title">
        <h2 id="limites-title" className="text-2xl font-bold">Limites de cette release</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {info.limitations.map((limitation, index) => (
            <li key={index} className="ui-card text-sm leading-6">{limitation}</li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg bg-brand-soft p-4 text-sm font-bold leading-6 text-brand">
          Démonstrateur pédagogique avec profils fictifs. Ces résultats ne constituent pas un diagnostic médical.
        </p>
      </section>
    </div>
  );
}

export default function PerformancesPage() {
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getModelInfo({ signal: controller.signal }).then(
      info => { if (!controller.signal.aborted) setState({ status: 'ready', info }); },
      error => { if (!controller.signal.aborted) setState({ status: 'error', message: error.message }); },
    );
    return () => controller.abort();
  }, [refresh]);

  return (
    <section aria-labelledby="performances-title">
      <div className="rounded-2xl bg-[#fff8fa] p-5 sm:p-8">
        <p className="text-sm font-bold text-brand">Jeu de données et résultats</p>
        <h1 id="performances-title" className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Données et performances</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Cette page présente les informations de la release ML réellement chargée par le backend.
          Les résultats concernent un jeu de recherche et ne garantissent pas la prédiction d’un cas individuel.
        </p>
      </div>

      {state.status === 'loading' && <p role="status" className="mt-8 rounded-lg bg-surface p-5">Chargement de la fiche du modèle…</p>}
      {state.status === 'error' && (
        <div className="mt-8 rounded-lg border border-brand bg-brand-soft p-5">
          <p role="alert" className="font-bold text-brand">{state.message}</p>
          <p className="mt-2 text-sm text-muted">Aucun chiffre de performance n’est affiché sans fiche validée.</p>
          <button type="button" className="mt-4 min-h-11 rounded-lg bg-brand px-4 font-bold text-white" onClick={() => setRefresh(value => value + 1)}>
            Réessayer
          </button>
        </div>
      )}
      {state.status === 'ready' && <ModelInfoView info={state.info} />}
    </section>
  );
}
