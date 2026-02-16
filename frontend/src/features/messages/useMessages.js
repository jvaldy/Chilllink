import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMessages, postMessage } from "./messageService";
import { useMercure } from "./useMercure";

/**
 * Hook métier Messages + Typing (Mercure)
 * - channel verrouillé => locked=true + pas de Mercure + pas de send
 */
export function useMessages(channelId) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locked, setLocked] = useState(false);

  const typingTimeoutsRef = useRef(new Map());

  const resetTyping = () => {
    setTypingUsers([]);
    typingTimeoutsRef.current.forEach((t) => clearTimeout(t));
    typingTimeoutsRef.current.clear();
  };

  /* =======================
     FETCH MESSAGES (REST)
  ======================= */
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setError(null);
      setLocked(false);
      resetTyping();
      return;
    }

    setLoading(true);
    setError(null);
    setLocked(false);

    fetchMessages(channelId)
      .then((data) => {
        setMessages(data);
        setLocked(false);
      })
      .catch((err) => {
        // httpClient doit te renvoyer un error avec status
        const status = err?.status;

        if (status === 403) {
          setLocked(true);
          setMessages([]); // optionnel: on garde vide
          setError(null);  // optionnel: on ne montre pas d’erreur brute
          resetTyping();
          return;
        }

        setError(err?.message || "Failed to load messages");
      })
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

    const existing = typingTimeoutsRef.current.get(data.userId);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      typingTimeoutsRef.current.delete(data.userId);
    }, 2500);

    typingTimeoutsRef.current.set(data.userId, timeout);
  }, []);

  /* =======================
     MERCURE (only if unlocked)
  ======================= */
  useMercure(channelId, !locked, (event) => {
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
    if (locked) {
      return { success: false, error: "LOCKED_CHANNEL" };
    }

    try {
      await postMessage(channelId, content);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || "Send failed" };
    }
  };

  return {
    messages,
    typingUsers,
    loading,
    error,
    locked,
    sendMessage,
  };
}
