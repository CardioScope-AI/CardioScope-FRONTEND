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

Les champs commencent vides. Les saisies sont conservées comme chaînes pour distinguer une valeur vide de zéro. Les listes ont une option vide « Sélectionner ». Les 13 champs sont désormais obligatoires selon le contrat de travail accepté ; les bornes métier restent à confirmer. La fréquence cardiaque et l'âge utilisent un pas entier ; les autres mesures acceptent les décimales.

Le sélecteur de profils fictifs préremplit les 13 champs avec l’un des trois exemples de `src/data/profils.js`. Modifier ensuite une valeur désélectionne l’exemple affiché. Le bouton de prédiction est connecté au client HTTP selon le contrat de travail décrit ci-dessous. Le contrôle `/api/health` reste accessible dans « Disponibilité du service ».

Vérification manuelle : ouvrir `/#simulation`, vérifier les 13 champs, saisir 0 dans une mesure, choisir « Non » et vérifier que ces valeurs restent affichées ; tester les libellés et le clavier ainsi que les mises en page à 375, 768 et 1280 px. Le formulaire utilise une, deux ou trois colonnes selon la largeur.

## Écran de résultat (tâche 08)

`src/components/SimulationResult.jsx` affiche une classe entière 0 (absence) ou 1 (présence), la mention pédagogique, un récapitulatif et le profil complet. Une classe inconnue affiche un message d’erreur ; aucun score de probabilité n’est inventé. Les libellés suivent la cible binaire définie dans le notebook ML.

Dans `npm run dev`, ouvrir `/#simulation` puis « Développement : aperçu du résultat ». Les boutons des classes 0 et 1 affichent une réponse simulée avec une copie des saisies courantes. Les champs vides restent « Non renseigné » ; une valeur 0 est conservée. Cet aperçu est exclu du build de production et n’appelle aucune API. Ce n’est pas un jeu de profils de démonstration validés.

« Nouvelle simulation » efface le résultat et les saisies, et replace le focus sur le formulaire. Le lien « Voir les performances » ouvre la vue correspondante. Le focus est placé sur le titre lors de l’apparition du résultat. La connexion frontend à `/predict` est décrite ci-dessous ; la vérification avec le backend réel reste à effectuer.

Contrôle manuel : essayer chaque classe en développement, vérifier l’absence de pourcentage, saisir âge/tension/cholestérol avant l’aperçu et vérifier le récapitulatif ; tester « Nouvelle simulation », le clavier et le rendu mobile.

## Connexion FastAPI (tâche 09)

Le brouillon est adopté comme contrat de travail : `POST /predict`, les 13 champs obligatoires et numériques avec les codes Cleveland, réponse `{ "prediction": 0 ou 1 }`. Le frontend appelle `/api/predict` via le proxy Vite. L'API réelle reste à implémenter et à vérifier côté backend.

`src/data/validateSimulation.js` vérifie les champs vides avant conversion, les nombres finis, les codes de listes et les pas entiers pour âge/fréquence cardiaque. Aucune borne médicale supplémentaire n'est inventée. Les erreurs sont reliées aux champs et le premier champ invalide reçoit le focus.

`src/api/prediction.js` gère la requête, les erreurs HTTP, les réponses mal formées, le délai de 15 secondes et l'annulation. Le formulaire bloque les doubles envois et les modifications pendant l'attente. Les saisies sont conservées en cas d'erreur ; le message reçoit le focus. Le résultat affiche une copie des valeurs numériques envoyées, sans mention de simulation pour une réponse API. « Nouvelle simulation » efface saisies et résultat. Quitter la vue annule la requête.

Les trois profils fictifs peuvent être chargés depuis le sélecteur du formulaire ; ils ne préjugent pas du résultat du modèle. Les aperçus de résultat restent explicitement simulés et accessibles uniquement en développement.

Vérification : `node --test tests/*.test.js`, puis `npm run build`. Les tests utilisent des réponses HTTP simulées et ne valident pas une prédiction réelle. Une API sans `/predict` renverra un message de service indisponible (404) ; un backend arrêté produira une erreur réseau ou proxy. Une vérification de bout en bout reste nécessaire dès que la route et le modèle entraîné sont disponibles.
