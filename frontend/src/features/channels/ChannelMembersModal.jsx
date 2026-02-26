import { useMemo, useState } from "react";
import { useChannelMembers } from "./useChannelMembers";
import "./Channel.css";

export default function ChannelMembersModal({
  workspaceId,
  channel,
  renameChannel,
  removeChannel,
  onClose,
}) {
  const channelId = channel.id;

  const { members, loading, add, remove } =
    useChannelMembers(workspaceId, channelId);

  const [email, setEmail] = useState("");
  const [newName, setNewName] = useState(channel.name);
  const [submitting, setSubmitting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.email || "").localeCompare(b.email || "")
    );
  }, [members]);

  /* =========================
     RENAME
  ========================= */
  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setRenaming(true);
    try {
      await renameChannel(channelId, newName.trim());
    } finally {
      setRenaming(false);
    }
  };

  /* =========================
     ADD MEMBER
  ========================= */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await add(email.trim());
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     REMOVE MEMBER
  ========================= */
  const handleRemove = async (userId) => {
    await remove(userId);
  };

  /* =========================
     DELETE CHANNEL
  ========================= */
  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce channel ?"))
      return;

    setDeleting(true);
    try {
      await removeChannel(channelId);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="cl-modal-backdrop" onMouseDown={onClose}>
      <div
        className="cl-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cl-modal-header">
          <div>
            <h3 className="cl-modal-title">
              🔒 Channel : {channel.name}
            </h3>
            <div className="cl-modal-subtitle">
              Gérer l’accès et les paramètres
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

        {/* RENAME */}
        <form onSubmit={handleRename} className="cl-invite">
          <label className="cl-label">Renommer</label>

          <div className="cl-row">
            <input
              className="cl-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={renaming}
            />

            <button
              type="submit"
              className="cl-btn cl-btn-primary"
              disabled={
                !newName.trim() ||
                newName.trim() === channel.name ||
                renaming
              }
            >
              {renaming ? "Modification…" : "Renommer"}
            </button>
          </div>
        </form>

        {/* ADD MEMBER */}
        <form onSubmit={handleAdd} className="cl-invite">
          <label className="cl-label">Ajouter un membre</label>

          <div className="cl-row">
            <input
              className="cl-input"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />

            <button
              type="submit"
              className="cl-btn cl-btn-primary"
              disabled={!email.trim() || submitting}
            >
              {submitting ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </form>

        {/* MEMBERS LIST */}
        {loading && (
          <div className="cl-modal-muted" style={{ marginLeft: 16 }}>
            Chargement…
          </div>
        )}

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
                    {(member.email?.[0] || "?").toUpperCase()}
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

        {/* DELETE */}
        <div className="cl-modal-alert">
          ⚠ Supprimer ce channel est irréversible.
        </div>

        <div className="cl-form">
          <button
            type="button"
            className="cl-btn cl-btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression…" : "🗑 Supprimer le channel"}
          </button>
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
