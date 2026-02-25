import { useMemo, useState } from "react";
import { authStore } from "../../auth/authStore";
import { useWorkspaceMembers } from "./useWorkspaceMembers";
import "../Workspace.css";

export default function WorkspaceMembersModal({ workspaceId, onClose }) {
  const [email, setEmail] = useState("");

  const { members, loading, submitting, error, inviteByEmail, removeMember } =
    useWorkspaceMembers(workspaceId, { enabled: true });

  const currentUserId = authStore.user?.id ?? null;

  const sortedMembers = useMemo(() => {
    return [...members].sort((memberA, memberB) =>
      (memberA.email || "").localeCompare(memberB.email || "")
    );
  }, [members]);

  const submitInvite = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    const response = await inviteByEmail(email.trim());
    if (response.success) setEmail("");
  };

  const handleRemove = async (userId) => {
    if (!userId) return;
    await removeMember(userId);
  };

  return (
    <div className="cl-modal-backdrop" onMouseDown={onClose}>
      <div className="cl-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="cl-modal-header">
          <div className="cl-modal-title-wrap">
            <h3 className="cl-modal-title">Membres du workspace  </h3>
            <div className="cl-modal-subtitle">
              Inviter / gérer les membres du workspace
            </div>
          </div>

          <button type="button" className="cl-modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {error && <div className="cl-modal-alert">Erreur : {error}</div>}
        {loading && <div className="cl-modal-muted">Chargement…</div>}

        <form className="cl-invite" onSubmit={submitInvite}>
          <label className="cl-label">Inviter</label>

          <div className="cl-row">
            <input
              className="cl-input"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              autoFocus
            />

            <button
              className="cl-btn cl-btn-primary"
              type="submit"
              disabled={submitting || !email.trim()}
            >
              {submitting ? "Envoi…" : "Inviter"}
            </button>
          </div>

          <div className="cl-hint">
            Le membre aura accès au workspace, mais pas forcément aux channels.
          </div>
        </form>

        <div className="cl-members">
          <div className="cl-members-head">
            <span className="cl-members-title">Liste</span>
            <span className="cl-members-count">{sortedMembers.length}</span>
          </div>

          <div className="cl-members-list">
            {sortedMembers.map((member) => {
              const isSelf = member.id === currentUserId;

              return (
                <div key={member.id} className="cl-member">
                  <div className="cl-member-left">
                    <div className="cl-member-avatar">
                      {(member.email?.trim()?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="cl-member-meta">
                      <div className="cl-member-email">{member.email}</div>
                      <div className="cl-member-id">id: {member.id}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cl-btn cl-btn-danger"
                    onClick={() => handleRemove(member.id)}
                    disabled={submitting || isSelf}
                    title={isSelf ? "Tu ne peux pas te retirer toi-même" : "Retirer"}
                  >
                    Retirer
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cl-modal-footer">
          <button type="button" className="cl-btn cl-btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}