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

  // Fonction d’ajout local (utilisé aussi par Mercure)
  const addMessage = useCallback(
    (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    [setMessages]
  );

  // Souscription Mercure : on ajoute le message reçu en temps réel
  useMercure(channelId, (data) => {
    // data doit être un objet message avec au minimum :
    // { id, content, author, createdAt }
    addMessage(data);
  });

  // Envoi d’un nouveau message
  const sendMessage = async (content) => {
    try {
      const newMsg = await postMessage(channelId, content);

      // On ajoute aussi localement (optimistic ou non)
      addMessage(newMsg);

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
    addMessage,
  };
}
