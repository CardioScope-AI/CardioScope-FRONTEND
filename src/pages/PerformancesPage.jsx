export default function PerformancesPage() {
  return (
    <section aria-labelledby="performances-title">
      <h1 id="performances-title" className="text-3xl font-bold">Données et performances</h1>
      <p className="mt-3 text-muted">Le protocole d’évaluation et les résultats du modèle Random Forest.</p>
      <div className="ui-card mt-6">
        <h2 className="text-lg font-bold">UCI Heart Disease / Cleveland</h2>
        <p className="mt-3 leading-7 text-muted">La cible est binaire : 0 pour l’absence et 1 pour la présence de maladie dans le jeu de données.</p>
      </div>
      <div className="ui-card mt-6">
        <h2 className="text-lg font-bold">Random Forest · Forêt aléatoire</h2>
        <p className="mt-3 leading-7 text-muted">Le modèle combine plusieurs arbres de décision pour prédire une classe à partir des données du profil.</p>
        <p className="mt-3 leading-7 text-muted">Les paramètres sont évalués par validation croisée sur les données d’entraînement. Le modèle final est ensuite évalué sur le jeu de test réservé.</p>
      </div>
      <div className="mt-6 rounded-xl bg-surface p-6">
        <h2 className="font-bold">Résultats en attente</h2>
        <p className="mt-2 text-sm text-muted">L’accuracy, la précision, le rappel, le F1-score, la ROC-AUC et la matrice de confusion seront ajoutés après validation des résultats par l’équipe ML.</p>
      </div>
    </section>
  );
}
