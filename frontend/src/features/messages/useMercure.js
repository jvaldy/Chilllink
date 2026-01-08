/**
 * useMercure.js
 * -------------
 * Hook pour souscrire à un topic Mercure (messages)
 */

import { useEffect } from "react";

export function useMercure(channelId, onMessage) {
  useEffect(() => {
    console.log("Mercure hook channelId (raw):", channelId);
    console.log("typeof channelId:", typeof channelId);

    if (!channelId) return;

    const mercureUrl = import.meta.env.VITE_MERCURE_URL;
    const url = new URL(mercureUrl);

    console.log("Will subscribe to Mercure with topic:", `channel/${channelId}`);

    url.searchParams.append("topic", `channel/${channelId}`);

    const eventSource = new EventSource(url.toString(), { withCredentials: true });

    eventSource.onopen = () => {
      console.log("Mercure EventSource opened for topic:", `channel/${channelId}`);
    };

    eventSource.onmessage = (event) => {
      console.log("Mercure raw event received:", event);
      console.log("Mercure event.data:", event.data);

      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Erreur Mercure parse :", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Mercure EventSource error:", err);
      eventSource.close();
    };

    return () => {
      console.log("Mercure unsubscribing from topic:", `channel/${channelId}`);
      eventSource.close();
    };
  }, [channelId, onMessage]);
}
