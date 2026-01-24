/**
 * ChannelList.jsx
 * ---------------
 * Liste des channels + création
 */

import { useState } from "react";

export default function ChannelList({
  channels,
  selectedChannelId,
  onSelect,
  onCreate,
  disabled,
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(name.trim());
    setName("");
    setCreating(false);
  };

  return (
    <div className="channel-list">
      {channels.map((c) => (
        <button
          key={c.id}
          className={`channel-item ${
            c.id === selectedChannelId ? "active" : ""
          }`}
          onClick={() => onSelect(c.id)}
        >
          # {c.name}
        </button>
      ))}

      {!disabled && (
        <>
          {creating ? (
            <form onSubmit={submit} className="channel-create">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nouveau channel"
                onBlur={() => setCreating(false)}
              />
            </form>
          ) : (
            <button
              className="channel-add"
              onClick={() => setCreating(true)}
              title="Créer un channel"
            >
              + Ajouter
            </button>
          )}
        </>
      )}
    </div>
  );
}
