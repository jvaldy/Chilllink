import { useRef, useCallback } from "react";
import { sendTyping } from "./typingService";

/**
 * Hook pour émettre les events "typing" (throttlé)
 */
export function useTyping(channelId, currentUser) {
  const lastSentRef = useRef(0);
  const THROTTLE_MS = 800;

  const notifyTyping = useCallback(() => {
    if (!channelId || !currentUser) return;

    const now = Date.now();

    if (now - lastSentRef.current < THROTTLE_MS) {
      return;
    }

    lastSentRef.current = now;

    sendTyping(channelId, currentUser).catch(() => {
      // silencieux : typing ne doit jamais bloquer l’UI
    });
  }, [channelId, currentUser]);

  return {
    notifyTyping,
  };
}
