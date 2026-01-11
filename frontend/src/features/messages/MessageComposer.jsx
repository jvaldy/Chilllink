/**
 * MessageComposer.jsx
 * -------------------
 * Composant pour composer et envoyer un message.
 * Intègre l’émission de l’événement "typing".
 */

import { useState } from "react";
import { useTyping } from "./useTyping";
import { authStore } from "../auth/authStore";

export default function MessageComposer({ onSend, channelId }) {
  const [content, setContent] = useState("");

  const currentUser = authStore.user;
  const { notifyTyping } = useTyping(channelId, currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    onSend(content.trim());
    setContent("");
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    notifyTyping(); // 🔔 typing throttlé
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        className="message-input"
        type="text"
        placeholder="Écrire un message…"
        value={content}
        onChange={handleChange}
      />

      <button className="message-btn" type="submit">
        Envoyer
      </button>
    </form>
  );
}
