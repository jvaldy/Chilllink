import { useEffect, useState, useCallback } from "react";
import { fetchMessages, postMessage } from "./messageService";
import { useMercure } from "./useMercure";

export function useMessages(channelId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les messages à l’ouverture d’un channel
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetchMessages(channelId)
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [channelId]);

  // Ajout centralisé des messages (Mercure uniquement)
  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Sécurité anti-doublon (au cas où)
      if (prev.some((m) => m.id === msg.id)) {
        return prev;
      }
      return [...prev, msg];
    });
  }, []);

  // Souscription Mercure : source UNIQUE de mise à jour temps réel
  useMercure(channelId, (data) => {
    addMessage(data);
  });

  // Envoi d’un nouveau message
  const sendMessage = async (content) => {
    try {
      await postMessage(channelId, content);
      // ❌ On NE touche PAS au state ici
      // Mercure s’en chargera
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
