import { useState } from "react";
import { useChannelMembers } from "./useChannelMembers";

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

  const handleAdd = async () => {
    if (!email.trim()) return;
    await add(email.trim());
    setEmail("");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Membres du channel</h3>

        {loading ? (
          <div>Chargement…</div>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{member.email}</span>
                <button onClick={() => remove(member.id)}>Retirer</button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 16 }}>
          <input
            placeholder="Email utilisateur"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleAdd}>Ajouter</button>
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
