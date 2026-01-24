/**
 * WorkspaceList.jsx
 * -----------------
 * Liste des workspaces + création via modal
 */

import { useState } from "react";
import "./Workspace.css";

export default function WorkspaceList({
  workspaces,
  selectedWorkspaceId,
  onSelect,
  addWorkspace,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addWorkspace(name.trim());
      setName("");
      setIsOpen(false);
    } catch (e) {
      // Optionnel: tu peux afficher un toast/UI error ici
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* LISTE DES WORKSPACES */}
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          className={`workspace-item ${
            ws.id === selectedWorkspaceId ? "active" : ""
          }`}
          onClick={() => onSelect(ws.id)}
          title={ws.name}
        >
          {ws.name.charAt(0).toUpperCase()}
        </button>
      ))}

      {/* BOUTON + */}
      <button
        className="workspace-item add"
        onClick={() => setIsOpen(true)}
        title="Créer un workspace"
      >
        +
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Créer un workspace</h3>

            <input
              type="text"
              placeholder="Nom du workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsOpen(false);
              }}
            />

            <div className="modal-actions">
              <button onClick={() => setIsOpen(false)}>Annuler</button>
              <button onClick={handleCreate} disabled={loading || !name.trim()}>
                {loading ? "Création…" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
