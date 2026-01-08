/**
 * MessageComposer.jsx
 * -------------------
 * Composant pour composer et envoyer un message.
 */

import { useState } from "react";

export default function MessageComposer({ onSend }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content.trim());
    setContent("");
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        className="message-input"
        type="text"
        placeholder="Écrire un message…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="message-btn" type="submit">
        Envoyer
      </button>
    </form>
  );
}
