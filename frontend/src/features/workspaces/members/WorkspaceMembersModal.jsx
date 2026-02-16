import { useMemo, useState } from "react";
import { authStore } from "../../auth/authStore";
import { useWorkspaceMembers } from "./useWorkspaceMembers";

export default function WorkspaceMembersModal({ workspaceId, onClose }) {
  const [email, setEmail] = useState("");

  const { members, loading, submitting, error, inviteByEmail, removeMember } =
    useWorkspaceMembers(workspaceId, { enabled: true });

  const currentUserId = authStore.user?.id ?? null;

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.email || "").localeCompare(b.email || "")
    );
  }, [members]);

  const submitInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const res = await inviteByEmail(email.trim());
    if (res.success) setEmail("");
  };

  const handleRemove = async (userId) => {
    if (!userId) return;
    await removeMember(userId);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Membres du workspace</h3>

        {loading && <div style={{ marginBottom: 8 }}>Chargement…</div>}

        {error && (
          <div style={{ marginBottom: 8, opacity: 0.85 }}>
            Erreur : {error}
          </div>
        )}

        <form onSubmit={submitInvite} style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Inviter par email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            autoFocus
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Fermer
            </button>

            <button type="submit" disabled={submitting || !email.trim()}>
              {submitting ? "Envoi…" : "Inviter"}
            </button>
          </div>
        </form>

        <div style={{ maxHeight: 320, overflow: "auto" }}>
          {sortedMembers.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{m.email}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>id: {m.id}</div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                disabled={submitting || m.id === currentUserId}
                title={
                  m.id === currentUserId
                    ? "Tu ne peux pas te retirer toi-même"
                    : "Retirer"
                }
              >
                Retirer
              </button>
            </div>
          ))}
        </div>

        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
