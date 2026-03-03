// Tests frontend: validation du module 'httpClient'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore } from "../../features/auth/authStore";
import { ApiError, httpRequest } from "./httpClient";

// Suite de tests: 'httpRequest'.
describe("httpRequest", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    authStore.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  // Scenario: ajoute le header Authorization quand un token existe
  it("ajoute le header Authorization quand un token existe", async () => {
    authStore.setToken("jwt-token");
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const data = await httpRequest("GET", "/me");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8888/api/me",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer jwt-token",
        }),
      })
    );
    expect(data).toEqual({ ok: true });
  });

  // Scenario: sur 401 vide le store auth et remonte une ApiError
  it("sur 401 vide le store auth et remonte une ApiError", async () => {
    authStore.setToken("expired-token");
    const clearSpy = vi.spyOn(authStore, "clear");

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    );

    const requestPromise = httpRequest("GET", "/me");
    await expect(requestPromise).rejects.toBeInstanceOf(ApiError);
    await expect(requestPromise).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });

    expect(clearSpy).toHaveBeenCalled();
    expect(authStore.token).toBeNull();
  });
});
