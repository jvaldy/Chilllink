// Tests frontend: validation du module 'channelMemberService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import {
  addChannelMember,
  fetchChannelMembers,
  removeChannelMember,
} from "./channelMemberService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'channelMemberService'.
describe("channelMemberService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: fetchChannelMembers appelle la route members
  it("fetchChannelMembers appelle la route members", async () => {
    await fetchChannelMembers(2, 6);
    expect(httpRequest).toHaveBeenCalledWith("GET", "/workspaces/2/channels/6/members");
  });

  // Scenario: addChannelMember envoie l'email
  it("addChannelMember envoie l'email", async () => {
    await addChannelMember(2, 6, "u@test.dev");
    expect(httpRequest).toHaveBeenCalledWith("POST", "/workspaces/2/channels/6/members", {
      body: { email: "u@test.dev" },
    });
  });

  // Scenario: removeChannelMember appelle DELETE /memberItem
  it("removeChannelMember appelle DELETE /memberItem", async () => {
    await removeChannelMember(2, 6, 8);
    expect(httpRequest).toHaveBeenCalledWith(
      "DELETE",
      "/workspaces/2/channels/6/members/8"
    );
  });
});
