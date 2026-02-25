import { useState } from "react";
import { useTyping } from "./useTyping";
import { authStore } from "../auth/authStore";
import "./Message.css";

export default function MessageComposer({ onSend, channelId, disabled = false }) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const currentUser = authStore.user;
  const { notifyTyping } = useTyping(channelId, currentUser);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) return;
    if (!content.trim()) return;

    setIsSending(true);

    try {
      await onSend(content.trim());
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setContent(value);

    if (!disabled) {
      notifyTyping();
    }
  };

  return (
    <form className="cl-composer" onSubmit={handleSubmit}>
      <div className="cl-composer-inner">
        <input
          className="cl-composer-input"
          type="text"
          placeholder={disabled ? "Channel verrouillé" : "Écrire un message…"}
          value={content}
          onChange={handleChange}
          disabled={disabled || isSending}
        />

        <button
          className="cl-composer-btn"
          type="submit"
          disabled={disabled || !content.trim() || isSending}
        >
          {isSending ? <span className="cl-spinner"></span> : "➤"}
        </button>
      </div>
    </form>
  );
}