// Tests frontend: validation du module 'workspaceService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import {
  createWorkspace,
  deleteWorkspace,
  fetchWorkspaces,
  updateWorkspace,
} from "./workspaceService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'workspaceService'.
describe("workspaceService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: fetchWorkspaces appelle GET /workspaces
  it("fetchWorkspaces appelle GET /workspaces", async () => {
    await fetchWorkspaces();
    expect(httpRequest).toHaveBeenCalledWith("GET", "/workspaces");
  });

  // Scenario: createWorkspace appelle POST /workspaces
  it("createWorkspace appelle POST /workspaces", async () => {
    await createWorkspace("Equipe");
    expect(httpRequest).toHaveBeenCalledWith("POST", "/workspaces", {
      body: { name: "Equipe" },
    });
  });

  // Scenario: updateWorkspace appelle PATCH /workspaces/:id
  it("updateWorkspace appelle PATCH /workspaces/:id", async () => {
    await updateWorkspace(4, "Nouveau");
    expect(httpRequest).toHaveBeenCalledWith("PATCH", "/workspaces/4", {
      body: { name: "Nouveau" },
    });
  });

  // Scenario: deleteWorkspace appelle DELETE /workspaces/:id
  it("deleteWorkspace appelle DELETE /workspaces/:id", async () => {
    await deleteWorkspace(4);
    expect(httpRequest).toHaveBeenCalledWith("DELETE", "/workspaces/4");
  });
});
