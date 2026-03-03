// Tests frontend: validation du module 'useWorkspaceMembers'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addWorkspaceMemberByEmail,
  fetchWorkspaceMembers,
  removeWorkspaceMember,
} from "./workspaceMemberService";
import { useWorkspaceMembers } from "./useWorkspaceMembers";

vi.mock("./workspaceMemberService", () => ({
  fetchWorkspaceMembers: vi.fn(),
  addWorkspaceMemberByEmail: vi.fn(),
  removeWorkspaceMember: vi.fn(),
}));

// Suite de tests: 'useWorkspaceMembers'.
describe("useWorkspaceMembers", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: refresh charge les membres
  it("refresh charge les membres", async () => {
    fetchWorkspaceMembers.mockResolvedValueOnce([{ id: 1, email: "a@a.com" }]);
    const { result } = renderHook(() => useWorkspaceMembers(5, { enabled: true }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.members).toEqual([{ id: 1, email: "a@a.com" }]);
  });

  // Scenario: inviteByEmail ajoute un membre dans le state
  it("inviteByEmail ajoute un membre dans le state", async () => {
    fetchWorkspaceMembers.mockResolvedValueOnce([]);
    addWorkspaceMemberByEmail.mockResolvedValueOnce({ user: { id: 3, email: "x@y.dev" } });

    const { result } = renderHook(() => useWorkspaceMembers(5, { enabled: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.inviteByEmail("x@y.dev");
    });

    expect(response).toEqual({ success: true });
    expect(result.current.members).toEqual([{ id: 3, email: "x@y.dev" }]);
  });

  // Scenario: inviteByEmail remonte une erreur metier
  it("inviteByEmail remonte une erreur metier", async () => {
    fetchWorkspaceMembers.mockResolvedValueOnce([]);
    addWorkspaceMemberByEmail.mockRejectedValueOnce(new Error("forbidden"));

    const { result } = renderHook(() => useWorkspaceMembers(5, { enabled: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.inviteByEmail("x@y.dev");
    });

    expect(response).toEqual({ success: false, error: "forbidden" });
    expect(result.current.error).toBe("forbidden");
  });

  // Scenario: removeMember retire l'utilisateur
  it("removeMember retire l'utilisateur", async () => {
    fetchWorkspaceMembers.mockResolvedValueOnce([{ id: 1, email: "a@a.com" }]);

    const { result } = renderHook(() => useWorkspaceMembers(5, { enabled: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.removeMember(1);
    });

    expect(removeWorkspaceMember).toHaveBeenCalledWith(5, 1);
    expect(response).toEqual({ success: true });
    expect(result.current.members).toEqual([]);
  });
});
