/**
 * useMercure.js
 * -------------
 * Hook pour souscrire à un topic Mercure (messages)
 * Version STABLE (anti-duplication)
 */

import { useEffect, useRef } from "react";

export function useMercure(channelId, onMessage) {
  const onMessageRef = useRef(onMessage);

  // Toujours garder la dernière version de onMessage
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!channelId) return;

    const mercureUrl = import.meta.env.VITE_MERCURE_URL;
    const url = new URL(mercureUrl);
    url.searchParams.append("topic", `channel/${channelId}`);

    console.log("Mercure subscribing to:", `channel/${channelId}`);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log("Mercure connected:", `channel/${channelId}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error("Mercure parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Mercure error:", err);
      eventSource.close();
    };

    return () => {
      console.log("Mercure unsubscribing from:", `channel/${channelId}`);
      eventSource.close();
    };
  }, [channelId]); // 🔥 DEPENDANCE UNIQUE
}
