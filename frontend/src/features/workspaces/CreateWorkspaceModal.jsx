import { useState } from "react";
import "./Workspace.css";

export default function CreateWorkspaceModal({ onCreate, onClose }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreate(name.trim());
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
            <h3 className="cl-modal-title">Créer un workspace</h3>
            <div className="cl-modal-subtitle">
              Organise tes channels dans un nouvel espace
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

        <form onSubmit={submit} className="cl-invite">
          <label className="cl-label">Nom</label>

          <div className="cl-row">
            <input
              className="cl-input"
              placeholder="Ex: Projet Chilllink"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              disabled={submitting}
              onKeyDown={(event) => {
                if (event.key === "Escape") onClose();
              }}
            />

            <button
              className="cl-btn cl-btn-primary"
              type="submit"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "Création…" : "Créer"}
            </button>
          </div>

          <div className="cl-hint">
            Tu pourras ensuite créer des channels à l’intérieur.
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