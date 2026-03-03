// Tests frontend: validation du module 'useWorkspaces'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWorkspace,
  deleteWorkspace,
  fetchWorkspaces,
  updateWorkspace,
} from "./workspaceService";
import { useWorkspaces } from "./useWorkspaces";

vi.mock("./workspaceService", () => ({
  fetchWorkspaces: vi.fn(),
  createWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
  updateWorkspace: vi.fn(),
}));

// Suite de tests: 'useWorkspaces'.
describe("useWorkspaces", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: charge les workspaces et selectionne le premier
  it("charge les workspaces et selectionne le premier", async () => {
    fetchWorkspaces.mockResolvedValueOnce([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workspaces).toHaveLength(2);
    expect(result.current.selectedWorkspaceId).toBe(1);
  });

  // Scenario: addWorkspace ajoute et selectionne le nouveau workspace
  it("addWorkspace ajoute et selectionne le nouveau workspace", async () => {
    fetchWorkspaces.mockResolvedValueOnce([]);
    createWorkspace.mockResolvedValueOnce({ id: 9, name: "Team" });

    const { result } = renderHook(() => useWorkspaces());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addWorkspace("Team");
    });

    expect(createWorkspace).toHaveBeenCalledWith("Team");
    expect(result.current.workspaces).toEqual([{ id: 9, name: "Team" }]);
    expect(result.current.selectedWorkspaceId).toBe(9);
  });

  // Scenario: removeWorkspace retire l'element et reselectionne
  it("removeWorkspace retire l'element et reselectionne", async () => {
    fetchWorkspaces.mockResolvedValueOnce([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);

    const { result } = renderHook(() => useWorkspaces());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeWorkspace(1);
    });

    expect(deleteWorkspace).toHaveBeenCalledWith(1);
    expect(result.current.workspaces).toEqual([{ id: 2, name: "B" }]);
    expect(result.current.selectedWorkspaceId).toBe(2);
  });

  // Scenario: renameWorkspace remplace l'entite dans la liste
  it("renameWorkspace remplace l'entite dans la liste", async () => {
    fetchWorkspaces.mockResolvedValueOnce([{ id: 1, name: "Old" }]);
    updateWorkspace.mockResolvedValueOnce({ id: 1, name: "New" });

    const { result } = renderHook(() => useWorkspaces());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameWorkspace(1, "New");
    });

    expect(result.current.workspaces).toEqual([{ id: 1, name: "New" }]);
  });

  // Scenario: expose une erreur de chargement
  it("expose une erreur de chargement", async () => {
    fetchWorkspaces.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
  });
});
