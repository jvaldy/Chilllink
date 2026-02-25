import { useState } from "react";
import "./Workspace.css";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

export default function WorkspaceList({
  workspaces,
  selectedWorkspaceId,
  onSelect,
  addWorkspace,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="workspace-item add"
        onClick={() => setIsOpen(true)}
        title="Créer un workspace"
      >
        +
      </button>

      {workspaces.map((ws) => (
        <button
          key={ws.id}
          type="button"
          className={`workspace-item ${ws.id === selectedWorkspaceId ? "active" : ""}`}
          onClick={() => onSelect(ws.id)}
          title={ws.name}
        >
          {ws.name.charAt(0).toUpperCase()}
        </button>
      ))}

      {isOpen && (
        <CreateWorkspaceModal
          onCreate={addWorkspace}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}