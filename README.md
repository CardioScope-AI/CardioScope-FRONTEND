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
- `src/App.jsx` : interface et vérification de `/api/health` avec les hooks React ; annulation des requêtes au démontage.
- `src/style.css` : Tailwind et styles globaux.
- `vite.config.js` : plugins React et Tailwind, proxy API pour le développement et la preview.

Modifier les fichiers de `src/` ; `dist/` est généré par la compilation.
