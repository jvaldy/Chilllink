// Tests frontend: validation du module 'ProtectedRoute'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { authStore } from "../../features/auth/authStore";
import ProtectedRoute from "./ProtectedRoute";

// Suite de tests: 'ProtectedRoute'.
describe("ProtectedRoute", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    authStore.clear();
  });

  // Scenario: redirige vers /login quand l'utilisateur n'est pas authentifie
  it("redirige vers /login quand l'utilisateur n'est pas authentifie", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  // Scenario: affiche le contenu protege quand l'utilisateur est authentifie
  it("affiche le contenu protege quand l'utilisateur est authentifie", () => {
    authStore.setToken("valid-token");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
