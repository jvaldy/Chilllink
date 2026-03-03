// Tests frontend: validation du module 'profileService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpRequest } from "../../shared/api/httpClient";
import { getProfile, patchProfile } from "./profileService";

vi.mock("../../shared/api/httpClient", () => ({
  httpRequest: vi.fn(),
}));

// Suite de tests: 'profileService'.
describe("profileService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: getProfile appelle GET /profile
  it("getProfile appelle GET /profile", async () => {
    await getProfile();
    expect(httpRequest).toHaveBeenCalledWith("GET", "/profile");
  });

  // Scenario: patchProfile appelle PATCH /profile avec payload
  it("patchProfile appelle PATCH /profile avec payload", async () => {
    const payload = { firstName: "Ada" };
    await patchProfile(payload);
    expect(httpRequest).toHaveBeenCalledWith("PATCH", "/profile", { body: payload });
  });
});
