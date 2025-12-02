
import { authStore } from "../features/auth/authStore";
import "./Dashboard.css";

export default function Dashboard() {
  const handleLogout = () => {
    authStore.clear();
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-title">Chats</div>

        <div className="sidebar-menu">
          <div className="sidebar-item active">💬 Discussions</div>
          <div className="sidebar-item">👥 Contacts</div>

          <div className="sidebar-separator"></div>

          <div className="sidebar-item logout" onClick={handleLogout}>
            🔓 Se déconnecter
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <h1>Bienvenue sur Chilllink 👋</h1>

        <p className="dashboard-text">
          Votre espace de discussions, workspaces et collaborations en temps réel.
        </p>

        <div className="dashboard-placeholder">
          Sélectionnez un chat ou un contact dans la sidebar pour commencer.
        </div>
      </main>
    </div>
  );
}
