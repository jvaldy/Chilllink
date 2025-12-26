/**
 * Composant Dashboard
 * ------------------
 * Représente la page principale de l’application Chilllink après connexion.
 *
 * Responsabilités :
 * - Afficher la structure globale de l’interface (sidebar + contenu principal)
 * - Proposer les différents accès fonctionnels (messagerie, workspaces, fichiers, etc.)
 * - Gérer la déconnexion de l’utilisateur
 *
 * Ce composant joue le rôle de layout principal de l’application connectée.
 */

import { useNavigate } from "react-router-dom";

// Store global d’authentification (gestion du token JWT)
import { authStore } from "../../features/auth/authStore";

// Styles spécifiques au dashboard
import "./Dashboard.css";

export default function Dashboard() {
  /**
   * Hook de navigation React Router
   * Utilisé ici principalement pour rediriger après déconnexion
   */
  const navigate = useNavigate();

  /**
   * Gestion de la déconnexion utilisateur
   *
   * Étapes :
   * - Suppression des informations d’authentification (token JWT)
   * - Redirection vers la page de connexion
   *
   * Le replace:true empêche l’utilisateur de revenir au dashboard via "retour"
   */
  const handleLogout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-container">
      {/* ===== SIDEBAR PRINCIPALE ===== */}
      <aside className="sidebar">

        {/* SECTION 1 — MESSAGERIE */}
        <div className="sidebar-section">
          <div className="sidebar-title">Messagerie</div>

          <div className="sidebar-menu">
            {/* Accès aux discussions (vue principale par défaut) */}
            <div className="sidebar-item active">
              <span className="icon">💬</span>
              Discussions
            </div>

            {/* Accès à la liste des workspaces */}
            <div className="sidebar-item">
              <span className="icon">🧩</span>
              Workspaces
            </div>

            {/* Accès aux canaux de discussion */}
            <div className="sidebar-item">
              <span className="icon">#️⃣</span>
              Canaux
            </div>

            {/* Accès aux contacts / messagerie privée */}
            <div className="sidebar-item">
              <span className="icon">👥</span>
              Contacts
            </div>
          </div>
        </div>

        {/* SECTION 2 — COLLABORATION */}
        <div className="sidebar-section">
          <div className="sidebar-title">Collaboration</div>

          <div className="sidebar-menu">
            {/* Gestion et partage de fichiers */}
            <div className="sidebar-item">
              <span className="icon">📁</span>
              Fichiers
            </div>

            {/* Recherche globale (messages, fichiers, utilisateurs) */}
            <div className="sidebar-item">
              <span className="icon">🔍</span>
              Recherche
            </div>
          </div>
        </div>

        {/* SECTION 3 — OUTILS */}
        <div className="sidebar-section">
          <div className="sidebar-title">Outils</div>

          <div className="sidebar-menu">
            {/* Centre de notifications */}
            <div className="sidebar-item">
              <span className="icon">🔔</span>
              Notifications
            </div>

            {/* Intégrations tierces et bots */}
            <div className="sidebar-item">
              <span className="icon">🤖</span>
              Intégrations & Bots
            </div>
          </div>
        </div>

        {/* SECTION 4 — COMPTE */}
        <div className="sidebar-section">
          <div className="sidebar-title">Compte</div>

          <div className="sidebar-menu">
            {/* Paramètres du compte utilisateur */}
            <div className="sidebar-item">
              <span className="icon">⚙️</span>
              Paramètres
            </div>

            {/* Préférences d’interface (thème, notifications, etc.) */}
            <div className="sidebar-item">
              <span className="icon">🎨</span>
              Préférences
            </div>

            {/* Déconnexion */}
            <div className="sidebar-item logout" onClick={handleLogout}>
              <span className="icon">🚪</span>
              Se déconnecter
            </div>
          </div>
        </div>

      </aside>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main className="dashboard-main">
        <h1>Bienvenue sur Chilllink 👋</h1>

        <p className="dashboard-text">
          Votre espace de discussions, workspaces et collaborations en temps réel.
        </p>

        {/* Placeholder affiché tant qu’aucune discussion n’est sélectionnée */}
        <div className="dashboard-placeholder">
          Sélectionnez un chat ou un contact dans la sidebar pour commencer.
        </div>
      </main>
    </div>
  );
}
