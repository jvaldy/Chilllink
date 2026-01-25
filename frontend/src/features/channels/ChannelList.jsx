/**
 * ChannelList.jsx
 * ----------------
 * Liste des channels + création via modal
 */

import { useState } from "react";
import "./Channel.css";

export default function ChannelList({
  channels,
  selectedChannelId,
  onSelect,
  addChannel,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addChannel(name.trim());
      setName("");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* LISTE DES CHANNELS */}
      {channels.map((channel) => (
        <button
          key={channel.id}
          className={`channel-item ${
            channel.id === selectedChannelId ? "active" : ""
          }`}
          onClick={() => onSelect(channel.id)}
          title={channel.name}
        >
          # {channel.name}
        </button>
      ))}

      {/* BOUTON AJOUT */}
      {!disabled && (
        <button
          className="channel-item add"
          onClick={() => setIsOpen(true)}
          title="Créer un channel"
        >
          + Ajouter un channel
        </button>
      )}

      {/* MODAL CRÉATION */}
      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Créer un channel</h3>

            <input
              type="text"
              placeholder="Nom du channel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div className="modal-actions">
              <button onClick={() => setIsOpen(false)}>Annuler</button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
              >
                {loading ? "Création…" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
