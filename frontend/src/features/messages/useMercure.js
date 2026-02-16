import { useEffect, useRef } from "react";

export function useMercure(channelId, enabled, onEvent) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!channelId || !enabled) return;

    const mercureUrl = import.meta.env.VITE_MERCURE_URL;
    const url = new URL(mercureUrl);

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
      eventSource.close();
    };

    return () => eventSource.close();
  }, [channelId, enabled]);
}
