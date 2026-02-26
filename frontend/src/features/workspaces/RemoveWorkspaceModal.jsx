import { useState } from "react";
import "./Workspace.css";

export default function RemoveWorkspaceModal({
  workspace,
  onConfirm,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await onConfirm(workspace.id);
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
              Supprimer le workspace
            </h3>
            <div className="cl-modal-subtitle">
              Cette action est irréversible
            </div>
          </div>

          <button
            type="button"
            className="cl-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="cl-modal-alert">
          Tous les channels et messages du workspace
          <strong> {workspace.name} </strong>
          seront définitivement supprimés.
        </div>

        <div className="cl-modal-muted">
          Cette action ne peut pas être annulée.
        </div>

        <div className="cl-modal-footer">
          <button
            type="button"
            className="cl-btn cl-btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Annuler
          </button>

          <button
            type="button"
            className="cl-btn cl-btn-danger"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}