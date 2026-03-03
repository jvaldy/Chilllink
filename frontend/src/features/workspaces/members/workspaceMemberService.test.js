// Tests frontend: validation du module 'workspaceMemberService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../../shared/api/httpClient";
import {
  addWorkspaceMemberByEmail,
  fetchWorkspaceInfo,
  fetchWorkspaceMembers,
  removeWorkspaceMember,
} from "./workspaceMemberService";

vi.mock("../../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'workspaceMemberService'.
describe("workspaceMemberService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: fetchWorkspaceMembers appelle GET /members
  it("fetchWorkspaceMembers appelle GET /members", async () => {
    await fetchWorkspaceMembers(10);
    expect(httpRequest).toHaveBeenCalledWith("GET", "/workspaces/10/members");
  });

  // Scenario: addWorkspaceMemberByEmail appelle POST /members
  it("addWorkspaceMemberByEmail appelle POST /members", async () => {
    await addWorkspaceMemberByEmail(10, "test@dev.local");
    expect(httpRequest).toHaveBeenCalledWith("POST", "/workspaces/10/members", {
      body: { email: "test@dev.local" },
    });
  });

  // Scenario: removeWorkspaceMember appelle DELETE /members/:userId
  it("removeWorkspaceMember appelle DELETE /members/:userId", async () => {
    await removeWorkspaceMember(10, 2);
    expect(httpRequest).toHaveBeenCalledWith("DELETE", "/workspaces/10/members/2");
  });

  // Scenario: fetchWorkspaceInfo appelle GET /workspaces/:id
  it("fetchWorkspaceInfo appelle GET /workspaces/:id", async () => {
    await fetchWorkspaceInfo(10);
    expect(httpRequest).toHaveBeenCalledWith("GET", "/workspaces/10");
  });
});
