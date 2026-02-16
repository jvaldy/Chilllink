/**
 * MessageComposer.jsx
 * -------------------
 * Composer + typing.
 * - disabled: channel verrouillé => pas d'input, pas de typing, pas d'envoi
 */

import { useState } from "react";
import { useTyping } from "./useTyping";
import { authStore } from "../auth/authStore";

export default function MessageComposer({ onSend, channelId, disabled = false }) {
  const [content, setContent] = useState("");

  const currentUser = authStore.user;
  const { notifyTyping } = useTyping(channelId, currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    if (!content.trim()) return;

    await onSend(content.trim());
    setContent("");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (!disabled) {
      notifyTyping();
    }
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        className="message-input"
        type="text"
        placeholder={disabled ? "Channel verrouillé" : "Écrire un message…"}
        value={content}
        onChange={handleChange}
        disabled={disabled}
      />

      <button className="message-btn" type="submit" disabled={disabled}>
        Envoyer
      </button>
    </form>
  );
}
