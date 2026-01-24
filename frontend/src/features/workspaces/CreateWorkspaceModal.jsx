import { useState } from "react";

export default function CreateWorkspaceModal({ onCreate, onClose }) {
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  };

  return (
    <div className="modal">
      <form onSubmit={submit}>
        <h3>Créer un workspace</h3>

        <input
          placeholder="Nom du workspace"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="actions">
          <button type="submit">Créer</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </div>
  );
}
