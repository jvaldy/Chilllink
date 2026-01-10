/**
 * WorkspaceList.jsx
 * -----------------
 * Affiche la liste des workspaces (style Discord).
 * Sélection via icône + tooltip.
 */

export default function WorkspaceList({
  workspaces,
  selectedWorkspaceId,
  onSelect,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="workspace-list">
        <div className="workspace-placeholder">...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-list">
        <div className="workspace-placeholder error">
          Erreur
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="workspace-list">
        <div className="workspace-placeholder">
          Ø
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-list">
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          type="button"
          className={`workspace-item ${
            ws.id === selectedWorkspaceId ? "active" : ""
          }`}
          data-name={ws.name}
          onClick={() => onSelect(ws.id)}
        >
          <span className="workspace-avatar">
            {ws.name?.[0] ?? "W"}
          </span>
        </button>
      ))}
    </div>
  );
}
