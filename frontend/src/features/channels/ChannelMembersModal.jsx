import { useMemo, useState } from "react";
import { useChannelMembers } from "./useChannelMembers";
import "./Channel.css";

export default function ChannelMembersModal({
  workspaceId,
  channelId,
  onClose,
}) {
  const { members, loading, add, remove } = useChannelMembers(
    workspaceId,
    channelId
  );

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.email || "").localeCompare(b.email || "")
    );
  }, [members]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await add(email.trim());
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    await remove(userId);
  };

  return (
    <div className="cl-modal-backdrop" onMouseDown={onClose}>
      <div
        className="cl-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cl-modal-header">
          <div>
            <h3 className="cl-modal-title">Membres du channel</h3>
            <div className="cl-modal-subtitle">
              Gérer l’accès à ce channel
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

        {loading && (
          <div className="cl-modal-muted" style={{ marginLeft: 16 }}>
            Chargement…
          </div>
        )}

        {/* INVITE BLOCK */}
        <form onSubmit={handleAdd} className="cl-invite">
          <label className="cl-label">Ajouter un membre</label>

          <div className="cl-row">
            <input
              className="cl-input"
              placeholder="email@exemple.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Escape") onClose();
              }}
            />

            <button
              type="submit"
              className="cl-btn cl-btn-primary"
              disabled={!email.trim() || submitting}
            >
              {submitting ? "Ajout…" : "Ajouter"}
            </button>
          </div>

          <div className="cl-hint">
            Seuls les membres ajoutés verront les messages.
          </div>
        </form>

        {/* MEMBERS LIST */}
        <div className="cl-members">
          <div className="cl-members-head">
            <span className="cl-members-title">Liste</span>
            <span className="cl-members-count">
              {sortedMembers.length}
            </span>
          </div>

          <div className="cl-members-list">
            {sortedMembers.map((member) => (
              <div key={member.id} className="cl-member">
                <div className="cl-member-left">
                  <div className="cl-member-avatar">
                    {(member.email?.trim()?.[0] || "?").toUpperCase()}
                  </div>

                  <div className="cl-member-meta">
                    <div className="cl-member-email">
                      {member.email}
                    </div>
                    <div className="cl-member-id">
                      id: {member.id}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="cl-btn cl-btn-danger"
                  onClick={() => handleRemove(member.id)}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cl-modal-footer">
          <button
            type="button"
            className="cl-btn cl-btn-ghost"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}