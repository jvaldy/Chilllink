import { useState } from "react";
import "./Workspace.css";

export default function RenameWorkspaceModal({
  workspace,
  onRename,
  onClose,
}) {
  const [name, setName] = useState(workspace.name);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onRename(workspace.id, name.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cl-modal-backdrop" onMouseDown={onClose}>
      <div
        className="cl-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cl-modal-header">
          <div>
            <h3 className="cl-modal-title">
              Renommer le workspace
            </h3>
            <div className="cl-modal-subtitle">
              Modifie le nom de ton espace
            </div>
          </div>

          <button
            type="button"
            className="cl-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="cl-invite">
          <label className="cl-label">Nom</label>

          <div className="cl-row">
            <input
              className="cl-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
              }}
            />

            <button
              className="cl-btn cl-btn-primary"
              type="submit"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "Modification…" : "Renommer"}
            </button>
          </div>
        </form>

        <div className="cl-modal-footer">
          <button
            type="button"
            className="cl-btn cl-btn-ghost"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}