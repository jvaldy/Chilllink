// Tests frontend: validation du module 'channelService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import {
  createChannel,
  deleteChannel,
  fetchChannelsByWorkspace,
  updateChannel,
} from "./channelService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'channelService'.
describe("channelService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: fetchChannelsByWorkspace appelle GET /workspaces/:id/channels
  it("fetchChannelsByWorkspace appelle GET /workspaces/:id/channels", async () => {
    await fetchChannelsByWorkspace(3);
    expect(httpRequest).toHaveBeenCalledWith("GET", "/workspaces/3/channels");
  });

  // Scenario: createChannel appelle POST avec body
  it("createChannel appelle POST avec body", async () => {
    await createChannel(3, "general");
    expect(httpRequest).toHaveBeenCalledWith("POST", "/workspaces/3/channels", {
      body: { name: "general" },
    });
  });

  // Scenario: updateChannel appelle PATCH sur la route item
  it("updateChannel appelle PATCH sur la route item", async () => {
    await updateChannel(3, 11, "renomme");
    expect(httpRequest).toHaveBeenCalledWith("PATCH", "/workspaces/3/channels/11", {
      body: { name: "renomme" },
    });
  });

  // Scenario: deleteChannel appelle DELETE sur la route item
  it("deleteChannel appelle DELETE sur la route item", async () => {
    await deleteChannel(3, 11);
    expect(httpRequest).toHaveBeenCalledWith("DELETE", "/workspaces/3/channels/11");
  });
});
