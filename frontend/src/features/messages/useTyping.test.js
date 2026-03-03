// Tests frontend: validation du module 'useTyping'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendTyping } from "./typingService";
import { useTyping } from "./useTyping";

vi.mock("./typingService", () => ({
  sendTyping: vi.fn(() => Promise.resolve()),
}));

// Suite de tests: 'useTyping'.
describe("useTyping", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-03T10:00:00.000Z"));
  });

  // Nettoyage execute apres chaque scenario.
  afterEach(() => {
    vi.useRealTimers();
  });

  // Scenario: n'envoie rien sans channelId ou user
  it("n'envoie rien sans channelId ou user", () => {
    const { result } = renderHook(() => useTyping(null, null));
    act(() => result.current.notifyTyping());
    expect(sendTyping).not.toHaveBeenCalled();
  });

  // Scenario: throttle les appels successifs
  it("throttle les appels successifs", () => {
    const { result } = renderHook(() => useTyping(2, { id: 1, username: "Ada" }));

    act(() => result.current.notifyTyping());
    act(() => result.current.notifyTyping());
    expect(sendTyping).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(900);
    act(() => result.current.notifyTyping());
    expect(sendTyping).toHaveBeenCalledTimes(2);
  });
});
