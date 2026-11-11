# CardioScope · Frontend

Interface pédagogique en React, Vite et Tailwind CSS. Accueil, accès à la section simulation et état de disponibilité de l’API. Le formulaire et les prédictions attendent la validation du contrat et le pipeline.

## Windows (PowerShell)
Node `24.15.0` (également indiqué dans `.nvmrc`) :
```powershell
npm.cmd ci
npm.cmd run dev
```
Ouvrir http://localhost:5173/#simulation. Lancer le backend sur le port 8000. Le navigateur appelle `/api/health` ; Vite retire `/api` et relaie vers `http://127.0.0.1:8000`. En Docker, `API_PROXY_TARGET=http://backend:8000`. Une réponse 503 est affichée comme une API accessible sans modèle.

```powershell
npm.cmd run build
npm.cmd run preview
```
La compilation écrit `dist/`. Le proxy fonctionne aussi en preview. Docker utilise `npm ci`, vérifie le build et lance le serveur Vite pour le développement d’équipe. Ce conteneur n’est pas une configuration de production.

## Code source

- `src/main.jsx` : point d’entrée React, montage de `App` dans `#app` avec StrictMode.
- `src/App.jsx` : assemblage du layout commun et de la page d’accueil.
- `src/components/layout/` : `Layout`, `Header` et `Footer` communs ; navigation par vues avec ancres, lien d’évitement et pied de page.
- `src/components/ui/Button.jsx` : bouton ou lien partagé avec variantes `primary` et `secondary`. Le bouton utilise `type="button"` par défaut ; préciser `type="submit"` pour un futur formulaire.
- `src/components/ApiStatus.jsx` : vérification de `/api/health` ; annulation des requêtes au démontage.
- `src/pages/HomePage.jsx` : accueil conforme à la page 1 des maquettes (bandeau et trois cartes).
- `src/style.css` : Tailwind et styles globaux.
- `vite.config.js` : plugins React et Tailwind, proxy API pour le développement et la preview.

Modifier les fichiers de `src/` ; `dist/` est généré par la compilation.

## Référence visuelle et navigation

Le thème commun suit `Documentation/Maquettes_CardioScope.pdf` et `Guide_Frontend_CardioScope.pdf` dans le dossier parent : accent bordeaux #AE2449, fond rose #FCEEF2, texte #171F32, bordures #E3E7EE. Les couleurs Tailwind sont centralisées dans `src/style.css`.

Les vues `#accueil`, `#simulation` et `#performances` partagent le layout ; la navigation indique la vue active avec `aria-current="page"`. L’accueil reprend les textes, le bandeau illustré et les cartes de la maquette. Simulation présente le formulaire provisoire ; Performances reste une vue d’attente. Les résultats et le tableau de métriques seront réalisés dans leurs tâches respectives. Aucun résultat de prédiction ni score ML fictif n’est présenté.

## Modèle présenté

Le frontend présente uniquement Random Forest (forêt aléatoire). La page Données et performances décrit la cible binaire et distingue la validation croisée sur l’entraînement de l’évaluation finale sur le test réservé. Les métriques restent en attente des résultats validés par l’équipe ML. Ce choix adapte les textes des maquettes sans changer leur thème ni la navigation.

## Formulaire de simulation (tâche 05)

`src/pages/SimulationPage.jsx` reprend les trois groupes et les 13 champs de la page 2 des maquettes. Les champs réutilisent `src/components/ui/FormField.jsx` ; les libellés, unités et codes Cleveland provisoires sont centralisés dans `src/data/simulationFields.js`.

Les champs commencent vides. Les saisies sont conservées comme chaînes pour distinguer une valeur vide de zéro. Les listes ont une option vide « Sélectionner ». Aucune borne ni obligation de saisie définitive n'est imposée avant validation du contrat API. La fréquence cardiaque et l'âge utilisent un pas entier ; les autres mesures acceptent les décimales.

Les boutons de chargement de profil et de prédiction restent désactivés avec une explication visible : profils fictifs, validation et intégration API appartiennent aux étapes suivantes. Le formulaire ne transmet aucune donnée et ne produit aucune prédiction. Le contrôle `/api/health` reste accessible dans « Disponibilité du service ».

Vérification manuelle : ouvrir `/#simulation`, vérifier les 13 champs, saisir 0 dans une mesure, choisir « Non » et vérifier que ces valeurs restent affichées ; tester les libellés et le clavier ainsi que les mises en page à 375, 768 et 1280 px. Le formulaire utilise une, deux ou trois colonnes selon la largeur.
