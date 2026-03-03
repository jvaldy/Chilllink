// Tests frontend: validation du module 'useMercure'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMercure } from "./useMercure";

// Suite de tests: 'useMercure'.
describe("useMercure", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_MERCURE_URL", "http://localhost/.well-known/mercure");
  });

  // Scenario: n'ouvre pas EventSource quand disabled=false ou channelId absent
  it("n'ouvre pas EventSource quand disabled=false ou channelId absent", () => {
    const eventSourceCtor = vi.fn();
    vi.stubGlobal("EventSource", eventSourceCtor);

    renderHook(() => useMercure(null, true, vi.fn()));
    renderHook(() => useMercure(2, false, vi.fn()));

    expect(eventSourceCtor).not.toHaveBeenCalled();
  });

  // Scenario: ouvre EventSource, parse les messages et ferme au unmount
  it("ouvre EventSource, parse les messages et ferme au unmount", () => {
    const close = vi.fn();
    const instance = { close, onopen: null, onmessage: null, onerror: null };
    const eventSourceCtor = vi.fn(() => instance);
    vi.stubGlobal("EventSource", eventSourceCtor);

    const onEvent = vi.fn();
    const { unmount } = renderHook(() => useMercure(7, true, onEvent));

    expect(eventSourceCtor).toHaveBeenCalledTimes(1);
    const [url] = eventSourceCtor.mock.calls[0];
    expect(url).toContain("topic=channel%2F7");
    expect(url).toContain("topic=typing%2Fchannel%2F7");

    act(() => {
      instance.onmessage({ data: JSON.stringify({ type: "message", payload: { id: 1 } }) });
    });
    expect(onEvent).toHaveBeenCalledWith({ type: "message", payload: { id: 1 } });

    unmount();
    expect(close).toHaveBeenCalled();
  });
});
