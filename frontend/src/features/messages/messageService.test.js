// Tests frontend: validation du module 'messageService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import { fetchMessages, postMessage } from "./messageService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'messageService'.
describe("messageService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: fetchMessages construit la query de pagination
  it("fetchMessages construit la query de pagination", async () => {
    await fetchMessages(9, { page: 2, limit: 20 });
    expect(httpRequest).toHaveBeenCalledWith("GET", "/channels/9/messages?page=2&limit=20");
  });

  // Scenario: postMessage envoie le contenu
  it("postMessage envoie le contenu", async () => {
    await postMessage(9, "bonjour");
    expect(httpRequest).toHaveBeenCalledWith("POST", "/channels/9/messages", {
      body: { content: "bonjour" },
    });
  });
});
