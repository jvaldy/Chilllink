/**
 * WorkspaceList.jsx
 * -----------------
 * Affiche la liste des workspaces et gère la sélection.
 */

export default function WorkspaceList({
  workspaces,
  selectedWorkspaceId,
  onSelect,
  loading,
  error,
}) {
  if (loading) {
    return <div className="sidebar-item">Chargement...</div>;
  }

  if (error) {
    return <div className="sidebar-item error">Erreur : {error}</div>;
  }

  if (workspaces.length === 0) {
    return <div className="sidebar-item">Aucun workspace</div>;
  }

  return (
    <>
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className={`sidebar-item ${
            ws.id === selectedWorkspaceId ? 'active' : ''
          }`}
          onClick={() => onSelect(ws.id)}
        >
          <span className="icon">🧩</span>
          {ws.name}
        </div>
      ))}
    </>
  );
}
