import { useEffect, useState } from 'react';
import {
  fetchHistory,
  fetchSimulationDetail,
} from '../api/history.js';
import { simulationGroups } from '../data/simulationFields.js';
import Button from '../components/ui/Button.jsx';

const PAGE_SIZE = 20;
const EMPTY_FILTERS = {
  prediction: '',
  createdFrom: '',
  createdBefore: '',
};

const PROFILE_FIELDS = simulationGroups.flatMap(group => group.fields);

function localDate(value) {
  return new Date(value).toLocaleString('fr-MA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function classLabel(value) {
  return value === 1 ? '1 — présence' : '0 — absence';
}

function displayProfileValue(field, value) {
  const option = field.options?.find(([code]) => code === value);
  return option ? option[1] : String(value);
}

export default function HistoryPage() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');
  const [loading, setLoading] = useState(true);

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailRefresh, setDetailRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError('');

    fetchHistory({
      ...filters,
      page,
      pageSize: PAGE_SIZE,
      signal: controller.signal,
    })
      .then(setResult)
      .catch(failure => {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(failure.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, page, refresh]);

  useEffect(() => {
    if (!detailId) return undefined;

    const controller = new AbortController();

    setDetail(null);
    setDetailError('');
    setDetailLoading(true);

    fetchSimulationDetail(detailId, { signal: controller.signal })
      .then(data => {
        if (!controller.signal.aborted) {
          setDetail(data);
        }
      })
      .catch(failure => {
        if (!controller.signal.aborted) {
          setDetailError(failure.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      });

    return () => controller.abort();
  }, [detailId, detailRefresh]);

  function applyFilters(event) {
    event.preventDefault();

    if (
      draft.createdFrom
      && draft.createdBefore
      && draft.createdFrom >= draft.createdBefore
    ) {
      setFilterError('La date « Avant le » doit être après la date « Du ».');
      return;
    }

    setFilterError('');
    setPage(1);
    setFilters({ ...draft });
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setFilterError('');
    setPage(1);
    setRefresh(value => value + 1);
  }

  function openDetail(id) {
    setDetail(null);
    setDetailError('');
    setDetailId(id);
  }

  function closeDetail() {
    setDetailId(null);
    setDetail(null);
    setDetailError('');
    setDetailLoading(false);
  }

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / PAGE_SIZE))
    : 1;

  return (
    <section aria-labelledby="history-title">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">
          Espace administrateur
        </p>
        <h1
          id="history-title"
          className="mt-2 text-3xl font-bold leading-tight sm:text-4xl"
        >
          Historique des simulations
        </h1>
        <p className="mt-3 text-muted">
          Consultez les profils fictifs enregistrés et leurs résultats.
          Les dates affichées suivent l’heure locale de votre appareil.
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="ui-card mt-8"
        aria-label="Filtrer l’historique"
      >
        <h2 className="text-xl font-bold">Filtres</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label
            className="block text-sm font-semibold"
            htmlFor="history-prediction"
          >
            Classe prédite
            <select
              id="history-prediction"
              className="ui-field mt-2"
              value={draft.prediction}
              onChange={event => setDraft({
                ...draft,
                prediction: event.target.value,
              })}
            >
              <option value="">Toutes les classes</option>
              <option value="0">0 — absence</option>
              <option value="1">1 — présence</option>
            </select>
          </label>

          <label className="block text-sm font-semibold" htmlFor="history-from">
            Du (inclus, UTC)
            <input
              id="history-from"
              type="date"
              className="ui-field mt-2"
              value={draft.createdFrom}
              onChange={event => setDraft({
                ...draft,
                createdFrom: event.target.value,
              })}
            />
          </label>

          <label
            className="block text-sm font-semibold"
            htmlFor="history-before"
          >
            Avant le (exclu, UTC)
            <input
              id="history-before"
              type="date"
              className="ui-field mt-2"
              value={draft.createdBefore}
              onChange={event => setDraft({
                ...draft,
                createdBefore: event.target.value,
              })}
            />
          </label>
        </div>

        {filterError && (
          <p role="alert" className="mt-3 text-sm font-semibold text-brand">
            {filterError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="submit">Appliquer les filtres</Button>
          <Button variant="secondary" onClick={resetFilters}>
            Effacer les filtres
          </Button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Simulations enregistrées</h2>
          {result && !loading && (
            <p className="mt-1 text-sm text-muted">
              {result.total} résultat{result.total > 1 ? 's' : ''} au total
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={() => setRefresh(value => value + 1)}
          disabled={loading}
        >
          Actualiser
        </Button>
      </div>

      {loading && (
        <p role="status" className="ui-card mt-4 text-muted">
          Chargement de l’historique…
        </p>
      )}

      {!loading && error && (
        <div role="alert" className="ui-card mt-4 border-brand text-brand">
          <p>{error}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setRefresh(value => value + 1)}
          >
            Réessayer
          </Button>
        </div>
      )}

      {!loading && result?.total === 0 && (
        <p className="ui-card mt-4 text-muted">
          Aucune simulation ne correspond à ces filtres.
        </p>
      )}

      {!loading && result && result.total > 0 && result.items.length === 0 && (
        <p className="ui-card mt-4 text-muted">
          Cette page est vide. Revenez à la page précédente.
        </p>
      )}

      {!loading && result && result.items.length > 0 && (
        <div className="mt-4">
          <ol
            className="space-y-3 sm:hidden"
            aria-label="Simulations de la plus récente à la plus ancienne"
          >
            {result.items.map(item => (
              <li key={item.id} className="ui-card">
                <p className="text-sm text-muted">
                  {localDate(item.created_at)}
                </p>
                <p className="mt-1 text-lg font-bold">
                  Classe {classLabel(item.prediction)}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted">Âge</dt>
                  <dd>{item.summary.age} ans</dd>
                  <dt className="text-muted">Pression au repos</dt>
                  <dd>{item.summary.trestbps} mmHg</dd>
                  <dt className="text-muted">Cholestérol</dt>
                  <dd>{item.summary.chol} mg/dL</dd>
                  <dt className="text-muted">Version</dt>
                  <dd className="break-all">{item.model_version}</dd>
                </dl>

                <Button
                  className="mt-4 w-full"
                  onClick={() => openDetail(item.id)}
                >
                  Voir le détail
                </Button>
              </li>
            ))}
          </ol>

          <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Liste des simulations, de la plus récente à la plus ancienne
              </caption>
              <thead className="bg-surface text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Classe prédite</th>
                  <th scope="col" className="px-4 py-3">Profil résumé</th>
                  <th scope="col" className="px-4 py-3">Version du modèle</th>
                  <th scope="col" className="px-4 py-3">Détail</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map(item => (
                  <tr
                    key={item.id}
                    className="border-t border-line align-top"
                  >
                    <td className="px-4 py-4">
                      {localDate(item.created_at)}
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {classLabel(item.prediction)}
                    </td>
                    <td className="px-4 py-4">
                      {item.summary.age} ans · {item.summary.trestbps} mmHg ·{' '}
                      {item.summary.chol} mg/dL
                    </td>
                    <td className="break-all px-4 py-4">
                      {item.model_version}
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="secondary"
                        onClick={() => openDetail(item.id)}
                      >
                        Voir le détail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailId && (
        <section
          aria-labelledby="simulation-detail-title"
          className="ui-card mt-6"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="simulation-detail-title" className="text-xl font-bold">
                Détail de la simulation
              </h2>
              <p className="mt-1 break-all text-sm text-muted">
                Identifiant : {detailId}
              </p>
            </div>

            <Button variant="secondary" onClick={closeDetail}>
              Fermer le détail
            </Button>
          </div>

          {detailLoading && (
            <p role="status" className="mt-4 text-muted">
              Chargement du détail…
            </p>
          )}

          {!detailLoading && detailError && (
            <div role="alert" className="mt-4">
              <p className="text-brand">{detailError}</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => setDetailRefresh(value => value + 1)}
              >
                Réessayer
              </Button>
            </div>
          )}

          {!detailLoading && detail && detail.id === detailId && (
            <>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Date</dt>
                  <dd>{localDate(detail.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Classe prédite</dt>
                  <dd>{classLabel(detail.prediction)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Version du modèle</dt>
                  <dd className="break-all">{detail.model_version}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Empreinte SHA-256</dt>
                  <dd className="break-all">{detail.artifact_sha256}</dd>
                </div>
              </dl>

              <h3 className="mt-6 text-lg font-bold">Profil enregistré</h3>
              <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {PROFILE_FIELDS.map(field => (
                  <div
                    key={field.name}
                    className="grid grid-cols-[1fr_auto] gap-3 border-t border-line py-2"
                  >
                    <dt className="text-muted">{field.label}</dt>
                    <dd className="text-right font-medium">
                      {displayProfileValue(
                        field,
                        detail.profile[field.name],
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
      )}

      {!loading && result && result.total > 0 && (
        <nav
          aria-label="Pages de l’historique"
          className="mt-5 flex flex-wrap items-center gap-3"
        >
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage(value => value - 1)}
          >
            Précédent
          </Button>
          <span aria-live="polite" className="text-sm font-semibold">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(value => value + 1)}
          >
            Suivant
          </Button>
        </nav>
      )}

      <p className="mt-8 text-sm text-muted">
        Résultats pédagogiques sur des profils fictifs ; ils ne constituent pas
        un diagnostic médical.
      </p>
    </section>
  );
}