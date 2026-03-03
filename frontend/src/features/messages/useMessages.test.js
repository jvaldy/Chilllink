// Tests frontend: validation du module 'useMessages'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchMessages, postMessage } from "./messageService";
import { useMessages } from "./useMessages";

const useMercureMock = vi.fn();

vi.mock("./messageService", () => ({
  fetchMessages: vi.fn(),
  postMessage: vi.fn(),
}));

vi.mock("./useMercure", () => ({
  useMercure: (...args) => useMercureMock(...args),
}));

// Suite de tests: 'useMessages'.
describe("useMessages", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: reset quand aucun channel n'est selectionne
  it("reset quand aucun channel n'est selectionne", async () => {
    const { result } = renderHook(() => useMessages(null));
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.locked).toBe(false);
  });

  // Scenario: charge les messages en succes
  it("charge les messages en succes", async () => {
    fetchMessages.mockResolvedValueOnce([{ id: 1, content: "hello" }]);
    const { result } = renderHook(() => useMessages(10));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages).toEqual([{ id: 1, content: "hello" }]);
    expect(result.current.locked).toBe(false);
  });

  // Scenario: passe en mode locked sur erreur 403
  it("passe en mode locked sur erreur 403", async () => {
    fetchMessages.mockRejectedValueOnce({ status: 403, message: "forbidden" });
    const { result } = renderHook(() => useMessages(10));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.locked).toBe(true);
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // Scenario: sendMessage retourne success en cas de post ok
  it("sendMessage retourne success en cas de post ok", async () => {
    fetchMessages.mockResolvedValueOnce([]);
    postMessage.mockResolvedValueOnce({});
    const { result } = renderHook(() => useMessages(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.sendMessage("Bonjour");
    });

    expect(response).toEqual({ success: true });
    expect(postMessage).toHaveBeenCalledWith(10, "Bonjour");
  });

  // Scenario: sendMessage bloque si channel verrouille
  it("sendMessage bloque si channel verrouille", async () => {
    fetchMessages.mockRejectedValueOnce({ status: 403 });
    const { result } = renderHook(() => useMessages(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.sendMessage("x");
    });

    expect(response).toEqual({ success: false, error: "LOCKED_CHANNEL" });
    expect(postMessage).not.toHaveBeenCalled();
  });

  // Scenario: integre les events Mercure message/typing
  it("integre les events Mercure message/typing", async () => {
    fetchMessages.mockResolvedValueOnce([]);
    let mercureCallback;
    useMercureMock.mockImplementation((_channelId, _enabled, cb) => {
      mercureCallback = cb;
    });

    const { result } = renderHook(() => useMessages(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      mercureCallback({ type: "message", payload: { id: 42, content: "rt" } });
      mercureCallback({ type: "typing", payload: { userId: 3, username: "Bob" } });
      mercureCallback({ type: "typing", payload: { userId: 3, username: "Bob" } });
    });

    expect(result.current.messages).toEqual([{ id: 42, content: "rt" }]);
    expect(result.current.typingUsers).toEqual([{ userId: 3, username: "Bob" }]);

    await waitFor(
      () => {
        expect(result.current.typingUsers).toEqual([]);
      },
      { timeout: 3500 }
    );
  });
});
