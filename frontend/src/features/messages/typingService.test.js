// Tests frontend: validation du module 'typingService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import { sendTyping } from "./typingService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'typingService'.
describe("typingService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: envoie le payload typing attendu
  it("envoie le payload typing attendu", async () => {
    await sendTyping(5, { id: 42, username: "Alice" });

    expect(httpRequest).toHaveBeenCalledWith("POST", "/channels/5/typing", {
      body: { userId: 42, username: "Alice" },
    });
  });
});
