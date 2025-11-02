# Chilllink

## Description  
Chilllink est une plateforme collaborative moderne pour la communication interne et la collaboration au sein d’une organisation.  
Elle se compose de trois microservices conteneurisés :  

- API backend (Symfony / PHP)  
- Base de données PostgreSQL  
- Frontend (React / Vite)  

## Architecture  
- **Backend** : `backend/`  
  - Framework : Symfony (PHP)  
  - Gestion des utilisateurs, workspaces, permissions, messagerie…  
- **Database** : PostgreSQL dans un service Docker dans ce dépôt  
- **Frontend** : `frontend/`  
  - Framework : React + Vite (TypeScript)  
  - Interface utilisateur (UI) pour échanges et canaux  

## Pré-requis  
- Docker & Docker Compose  
- Git (avec Sourcetree ou cmd)  
- Node.js et npm (pour développement frontend local)  
- Composer (pour backend)  

## Installation & démarrage local  
1. Cloner le dépôt :  
   git clone <url-du-dépôt> chilllink
   cd chilllink

2. Créer les branches principales (si non déjà créées) :
    git checkout -b develop
    git checkout main

3. Lancer les conteneurs Docker :
    docker-compose build --no-cache
    docker-compose up

4. Accès aux services :
    - Base de données (Adminer) : http://localhost:8081
        Utilisateur : user_chl_w3Z9k4 / Mot de passe : pass_9qA@1eN!b7
    - API backend : http://localhost:8080
    - Frontend : http://localhost:5173