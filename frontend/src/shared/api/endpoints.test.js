// Tests frontend: validation du module 'endpoints'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { describe, expect, it } from "vitest";
import { API_BASE, endpoints } from "./endpoints";

// Suite de tests: 'endpoints'.
describe("endpoints", () => {
  // Scenario: expose la base API
  it("expose la base API", () => {
    expect(API_BASE).toBe("http://localhost:8888/api");
  });

  // Scenario: genere les routes dynamiques attendues
  it("genere les routes dynamiques attendues", () => {
    expect(endpoints.auth.me).toBe("/me");
    expect(endpoints.workspaces.item(12)).toBe("/workspaces/12");
    expect(endpoints.workspaces.channels(3)).toBe("/workspaces/3/channels");
    expect(endpoints.workspaces.members(7)).toBe("/workspaces/7/members");
    expect(endpoints.workspaces.memberItem(7, 9)).toBe("/workspaces/7/members/9");

    expect(endpoints.channels.messages(18)).toBe("/channels/18/messages");
    expect(endpoints.channels.typing(18)).toBe("/channels/18/typing");
    expect(endpoints.channels.members(2, 4)).toBe("/workspaces/2/channels/4/members");
    expect(endpoints.channels.memberItem(2, 4, 11)).toBe(
      "/workspaces/2/channels/4/members/11"
    );

    expect(endpoints.profile.item).toBe("/profile");
  });
});
