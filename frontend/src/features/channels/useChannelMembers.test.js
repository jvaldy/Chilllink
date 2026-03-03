// Tests frontend: validation du module 'useChannelMembers'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addChannelMember,
  fetchChannelMembers,
  removeChannelMember,
} from "./channelMemberService";
import { useChannelMembers } from "./useChannelMembers";

vi.mock("./channelMemberService", () => ({
  fetchChannelMembers: vi.fn(),
  addChannelMember: vi.fn(),
  removeChannelMember: vi.fn(),
}));

// Suite de tests: 'useChannelMembers'.
describe("useChannelMembers", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: charge les membres au montage
  it("charge les membres au montage", async () => {
    fetchChannelMembers.mockResolvedValueOnce([{ id: 1, email: "a@a.com" }]);
    const { result } = renderHook(() => useChannelMembers(1, 2));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.members).toEqual([{ id: 1, email: "a@a.com" }]);
  });

  // Scenario: add appelle le service puis recharge
  it("add appelle le service puis recharge", async () => {
    fetchChannelMembers
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 3, email: "x@y.dev" }]);

    const { result } = renderHook(() => useChannelMembers(1, 2));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.add("x@y.dev");
    });

    expect(addChannelMember).toHaveBeenCalledWith(1, 2, "x@y.dev");
    expect(result.current.members).toEqual([{ id: 3, email: "x@y.dev" }]);
  });

  // Scenario: remove met a jour localement la liste
  it("remove met a jour localement la liste", async () => {
    fetchChannelMembers.mockResolvedValueOnce([
      { id: 1, email: "a@a.com" },
      { id: 2, email: "b@b.com" },
    ]);
    const { result } = renderHook(() => useChannelMembers(1, 2));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(removeChannelMember).toHaveBeenCalledWith(1, 2, 1);
    expect(result.current.members).toEqual([{ id: 2, email: "b@b.com" }]);
  });
});
