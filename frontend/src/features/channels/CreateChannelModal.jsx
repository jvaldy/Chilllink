import { useState } from "react";
import "./Channel.css";

export default function CreateChannelModal({ onCreate, onClose }) {
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
            <h3 className="cl-modal-title">Créer un channel</h3>
            <div className="cl-modal-subtitle">
              Ajouter un espace de discussion dans ce workspace
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
              placeholder="Ex: général"
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
            Les membres du workspace ne verront pas les messages
            s’ils ne sont pas ajoutés au channel.
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