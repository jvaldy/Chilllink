// Tests frontend: validation du module 'authStore'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore } from "./authStore";

// Suite de tests: 'authStore'.
describe("authStore", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    localStorage.clear();
    authStore.clear();
  });

  // Scenario: setToken stocke le token et authentifie l'utilisateur
  it("setToken stocke le token et authentifie l'utilisateur", () => {
    authStore.setToken("token-123");

    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.token).toBe("token-123");
    expect(localStorage.getItem("authToken")).toBe("token-123");
  });

  // Scenario: notifie les listeners puis permet un unsubscribe propre
  it("notifie les listeners puis permet un unsubscribe propre", () => {
    const listener = vi.fn();
    const unsubscribe = authStore.subscribe(listener);

    authStore.setUser({ id: 7, email: "dev@chilllink.test" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({
      token: null,
      user: { id: 7, email: "dev@chilllink.test" },
    });

    unsubscribe();
    authStore.setToken("next-token");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  // Scenario: clear supprime token, user et stockage local
  it("clear supprime token, user et stockage local", () => {
    authStore.setAuth("token-abc", { id: 1, email: "user@test.dev" });
    authStore.clear();

    expect(authStore.token).toBeNull();
    expect(authStore.user).toBeNull();
    expect(authStore.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});
