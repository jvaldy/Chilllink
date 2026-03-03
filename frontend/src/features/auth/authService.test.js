// Tests frontend: validation du module 'authService'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getToken,
  loginUser,
  registerUser,
  removeToken,
  saveToken,
} from "./authService";

// Suite de tests: 'authService'.
describe("authService", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  // Scenario: registerUser retourne success=true si l'API repond OK
  it("registerUser retourne success=true si l'API repond OK", async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), {
        status: 201,
        headers: { "content-type": "application/json" },
      })
    );

    const result = await registerUser({ email: "u@test.dev", password: "secret" });

    expect(result).toEqual({ success: true, data: { id: 1 } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8888/api/register",
      expect.objectContaining({ method: "POST" })
    );
  });

  // Scenario: registerUser retourne une erreur lisible si l'API refuse
  it("registerUser retourne une erreur lisible si l'API refuse", async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Email deja pris" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    );

    const result = await registerUser({ email: "u@test.dev", password: "secret" });
    expect(result).toEqual({ success: false, error: "Email deja pris" });
  });

  // Scenario: loginUser retourne token en cas de succes
  it("loginUser retourne token en cas de succes", async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "jwt" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const result = await loginUser({ email: "u@test.dev", password: "secret" });
    expect(result).toEqual({ success: true, token: "jwt" });
  });

  // Scenario: loginUser retourne une erreur en cas d'identifiants invalides
  it("loginUser retourne une erreur en cas d'identifiants invalides", async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Identifiants invalides" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    );

    const result = await loginUser({ email: "u@test.dev", password: "bad" });
    expect(result).toEqual({ success: false, error: "Identifiants invalides" });
  });

  // Scenario: gere les operations de token dans localStorage
  it("gere les operations de token dans localStorage", () => {
    saveToken("abc");
    expect(getToken()).toBe("abc");
    removeToken();
    expect(getToken()).toBeNull();
  });
});
