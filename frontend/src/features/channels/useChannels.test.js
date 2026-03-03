// Tests frontend: validation du module 'useChannels'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createChannel,
  deleteChannel,
  fetchChannelsByWorkspace,
  updateChannel,
} from "./channelService";
import { useChannels } from "./useChannels";

vi.mock("./channelService", () => ({
  fetchChannelsByWorkspace: vi.fn(),
  createChannel: vi.fn(),
  updateChannel: vi.fn(),
  deleteChannel: vi.fn(),
}));

// Suite de tests: 'useChannels'.
describe("useChannels", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: reset si workspaceId est absent
  it("reset si workspaceId est absent", async () => {
    const { result } = renderHook(() => useChannels(null));
    expect(result.current.channels).toEqual([]);
    expect(result.current.selectedChannelId).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  // Scenario: charge les channels et selectionne le premier
  it("charge les channels et selectionne le premier", async () => {
    fetchChannelsByWorkspace.mockResolvedValueOnce([
      { id: 10, name: "general" },
      { id: 11, name: "random" },
    ]);

    const { result } = renderHook(() => useChannels(5));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchChannelsByWorkspace).toHaveBeenCalledWith(5);
    expect(result.current.channels).toHaveLength(2);
    expect(result.current.selectedChannelId).toBe(10);
  });

  // Scenario: addChannel ajoute le channel cree
  it("addChannel ajoute le channel cree", async () => {
    fetchChannelsByWorkspace.mockResolvedValueOnce([]);
    createChannel.mockResolvedValueOnce({ id: 99, name: "new" });

    const { result } = renderHook(() => useChannels(5));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addChannel("new");
    });

    expect(createChannel).toHaveBeenCalledWith(5, "new");
    expect(result.current.channels).toEqual([{ id: 99, name: "new" }]);
    expect(result.current.selectedChannelId).toBe(99);
  });

  // Scenario: renameChannel remplace un element
  it("renameChannel remplace un element", async () => {
    fetchChannelsByWorkspace.mockResolvedValueOnce([{ id: 1, name: "old" }]);
    updateChannel.mockResolvedValueOnce({ id: 1, name: "new" });

    const { result } = renderHook(() => useChannels(2));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameChannel(1, "new");
    });

    expect(result.current.channels).toEqual([{ id: 1, name: "new" }]);
  });

  // Scenario: removeChannel retire et deselctionne si besoin
  it("removeChannel retire et deselctionne si besoin", async () => {
    fetchChannelsByWorkspace.mockResolvedValueOnce([{ id: 1, name: "a" }]);

    const { result } = renderHook(() => useChannels(2));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeChannel(1);
    });

    expect(deleteChannel).toHaveBeenCalledWith(2, 1);
    expect(result.current.channels).toEqual([]);
    expect(result.current.selectedChannelId).toBeNull();
  });

  // Scenario: capture les erreurs de fetch
  it("capture les erreurs de fetch", async () => {
    fetchChannelsByWorkspace.mockRejectedValueOnce(new Error("fetch failed"));
    const { result } = renderHook(() => useChannels(3));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("fetch failed");
    expect(result.current.channels).toEqual([]);
  });
});
