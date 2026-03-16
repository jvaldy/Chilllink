# Chilllink

Chilllink est une application de collaboration en temps reel:
- authentification JWT
- gestion de workspaces et channels
- messagerie avec push temps reel via Mercure
- interface React

## Stack technique
- Backend: Symfony 6.4 (PHP 8.1+)
- Frontend: React + Vite (JavaScript)
- Base de donnees: PostgreSQL 16
- Temps reel: Mercure
- Conteneurisation: Docker Compose
- Tests: PHPUnit (backend), Vitest + Cypress (frontend)

## Automatisation CI/CD
Le workflow GitHub Actions est defini dans:
- `.github/workflows/ci.yml`

A chaque push / pull request:
- Frontend:
  - `npm ci`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - publication de l'artefact `frontend-dist`
- Backend:
  - `composer validate --strict`
  - `composer install`
  - verification syntaxe PHP (`php -l`)
  - `vendor/bin/phpunit`
  - verification d'installation production (`composer install --no-dev`)
  - publication du rapport `backend-phpunit-report`
- Docker:
  - build image API
  - build image frontend dev
  - build image frontend prod (Nginx)

Objectif:
- automatiser les controles qualite
- verifier les tests et les builds avant livraison
- preparer le deploiement avec des images Docker deja construites en CI

## Arborescence
- `backend/`: API Symfony, entites, controleurs, services, tests
- `frontend/`: UI React, hooks/services metier, tests
- `docker/`: donnees locales PostgreSQL
- `docker-compose.yml`: orchestration locale
- `docker-compose.prod.yml`: profil "prod-like" local (plus rapide)

## Diagrammes de conception
- UML classes: `docs/diagrams/data-models/uml-class.mmd`
- EER: `docs/diagrams/data-models/eer.mmd`
- MCD (Merise): `docs/diagrams/data-models/mcd.mmd`
- MPD (PostgreSQL): `docs/diagrams/data-models/mpd.sql`
- Architecture technique: `docs/diagrams/architecture/architecture.mmd`
- Diagrammes fonctionnels: `docs/diagrams/functional/`
- Diagrammes de sequence: `docs/diagrams/sequences/`
- Planning: `docs/diagrams/planning/planning.mmd`
- Mind map projet: `docs/diagrams/mindmaps/project-mindmap.mmd`
- Versions texte (ouverture facile): `docs/diagrams/*/*.txt`
## Prerequis
- Docker Desktop (ou Docker Engine + Docker Compose plugin)
- Git
- Optionnel: Node.js + npm (si execution frontend hors Docker)
- Optionnel: PHP + Composer (si execution backend hors Docker)

## Demarrage rapide (Docker)
1. Cloner le depot:
```bash
git clone <url-du-repo> Chilllink
cd Chilllink
```

2. Creer le fichier d environnement Docker Compose:
```bash
cp .env.example .env
```
Sous PowerShell:
```powershell
Copy-Item .env.example .env
```
Puis definir `MERCURE_JWT_SECRET` dans `.env`.
Variables minimales a definir (voir le template):
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `APP_SECRET`
- `JWT_PASSPHRASE`
- `DATABASE_URL`
- `MERCURE_JWT_SECRET`

3. Construire et demarrer tous les services:
```bash
docker compose up -d --build
```

4. Verifier les services:
- Frontend: http://localhost:5174
- API Symfony: http://localhost:8888
- Swagger UI: http://localhost:8888/api/doc
- Swagger JSON: http://localhost:8888/api/doc.json
- Adminer: http://localhost:8082
- Mercure Hub: http://localhost:8085/.well-known/mercure

5. Initialiser la base (si necessaire):
```bash
docker compose exec api php bin/console doctrine:migrations:migrate -n
```

## Mode "prod-like" (plus rapide dans le navigateur)
Ce mode coupe le hot-reload et sert le front builde par Nginx.
Il est utile pour tester les performances localement.

Lancement:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Differences principales:
- `frontend`: build Vite + Nginx (au lieu de `vite dev`)
- `api`: `APP_ENV=prod` et `APP_DEBUG=0`
- pas de bind mounts sur `api` et `frontend` (moins de latence I/O)

Retour au mode dev classique:
```bash
docker compose down
docker compose up -d --build
```

## Arret et nettoyage
- Arreter:
```bash
docker compose down
```
- Arreter + supprimer volumes:
```bash
docker compose down -v
```

## Commandes utiles

### Backend
- Ouvrir un shell dans le container:
```bash
docker compose exec api sh
```
- Lancer les tests:
```bash
docker compose exec api vendor/bin/phpunit --testdox
```

### Frontend
- Le frontend est demarre automatiquement par Docker Compose (pas besoin de `npm run dev` manuel sur la machine hote).
- Lancer les tests:
```bash
docker compose exec frontend npm run test
```
- Couverture:
```bash
docker compose exec frontend npm run test:coverage
```
- E2E Cypress (recommande en local, avec front + back demarres):
```bash
cd frontend
npm run e2e:open
```
- E2E headless:
```bash
cd frontend
npm run e2e
```

## Execution hors Docker (optionnel)

### Backend
```bash
cd backend
composer install
php -S 127.0.0.1:8888 -t public
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### E2E Cypress
Avec l'API sur `http://localhost:8888` et le front sur `http://localhost:5174`:
```bash
cd frontend
npm run e2e:open
```
Premier scenario ajoute:
- `cypress/e2e/auth-dashboard.cy.js`
- parcours valide: inscription de preparation via API, login via UI, acces au dashboard

## API et authentification
- Endpoint public d inscription: `POST /api/register`
- Endpoint public de login JWT: `POST /api/login_check`
- Format du body pour le login JWT:
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```
- Le champ `email` est le format recommande sur `/api/login_check`.
- Le champ legacy `username` est aussi accepte s il contient l email utilisateur.
- Les autres routes API sont securisees par bearer token.
- Documentation OpenAPI via Nelmio:
  - `/api/doc`
  - `/api/doc.json`

## Mode dev vs mode production
- `npm run dev`: serveur Vite de developpement (HMR), pratique en local.
- `npm run build`: genere les assets de production dans `frontend/dist`.
- `npm run preview`: apercu local du build.

En production, on sert generalement le contenu de `dist/` avec Nginx/Caddy/Apache, pas avec le serveur dev Vite.

## Depannage rapide
- Frontend inaccessible:
  - verifier que `frontend` est `Up`: `docker compose ps`
  - verifier les logs: `docker compose logs -f frontend`
- API inaccessible:
  - verifier les logs: `docker compose logs -f api`
- Erreurs DB au demarrage:
  - verifier `db` et relancer les migrations.

## Notes de securite
- Les variables sensibles DB / APP / JWT sont aussi lues depuis le `.env` racine Docker Compose.

