import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMessages, postMessage } from "./messageService";
import { useMercure } from "./useMercure";

/**
 * Hook métier Messages + Typing (Mercure)
 * Export nommé : useMessages
 */
export function useMessages(channelId) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gestion propre des timeouts typing par userId
  const typingTimeoutsRef = useRef(new Map());

  /* =======================
     FETCH MESSAGES (REST)
  ======================= */
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setTypingUsers([]);

      typingTimeoutsRef.current.forEach((t) => clearTimeout(t));
      typingTimeoutsRef.current.clear();

      return;
    }

    setLoading(true);
    setError(null);

    fetchMessages(channelId)
      .then((data) => setMessages(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  /* =======================
     MESSAGE HANDLING
  ======================= */
  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  /* =======================
     TYPING HANDLING
  ======================= */
  const handleTypingEvent = useCallback((data) => {
    if (!data?.userId) return;

    setTypingUsers((prev) => {
      if (prev.some((u) => u.userId === data.userId)) return prev;
      return [...prev, data];
    });

    // reset timeout pour ce user
    const existing = typingTimeoutsRef.current.get(data.userId);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      typingTimeoutsRef.current.delete(data.userId);
    }, 2500);

    typingTimeoutsRef.current.set(data.userId, timeout);
  }, []);

  /* =======================
     MERCURE SUBSCRIPTION
  ======================= */
  useMercure(channelId, (event) => {
    if (!event || !event.type) return;

    switch (event.type) {
      case "message":
        addMessage(event.payload);
        break;

      case "typing":
        handleTypingEvent(event.payload);
        break;

      default:
        console.warn("Unknown Mercure event type:", event.type);
    }
  });

  /* =======================
     SEND MESSAGE
  ======================= */
  const sendMessage = async (content) => {
    try {
      await postMessage(channelId, content);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    messages,
    typingUsers,
    loading,
    error,
    sendMessage,
  };
}
