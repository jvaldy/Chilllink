/**
 * useMercure.js
 * -------------
 * Hook pour souscrire à Mercure (messages + typing)
 * Version stable (anti-duplication / callback stable)
 */

import { useEffect, useRef } from "react";

export function useMercure(channelId, onEvent) {
  const onEventRef = useRef(onEvent);

  // Toujours garder la dernière version de callback sans relancer la subscription
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!channelId) return;

    const mercureUrl = import.meta.env.VITE_MERCURE_URL;
    const url = new URL(mercureUrl);

    // ✅ 2 topics : messages + typing
    url.searchParams.append("topic", `channel/${channelId}`);
    url.searchParams.append("topic", `typing/channel/${channelId}`);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log("Mercure connected:", url.toString());
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEventRef.current?.(data);
      } catch (err) {
        console.error("Mercure parse error:", err, event?.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Mercure error:", err);
      // On ferme pour éviter boucle de reconnexion infinie si CORS / auth / offline
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [channelId]);
}
