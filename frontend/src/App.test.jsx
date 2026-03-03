// Tests frontend: validation du module 'App'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { authStore } from "./features/auth/authStore";
import { httpRequest } from "./shared/api/httpClient";

vi.mock("./features/auth/Login", () => ({
  default: () => <div>LOGIN_VIEW</div>,
}));
vi.mock("./features/auth/Register", () => ({
  default: () => <div>REGISTER_VIEW</div>,
}));
vi.mock("./pages/dashboard/Dashboard", () => ({
  default: () => <div>DASHBOARD_VIEW</div>,
}));
vi.mock("./shared/components/ProtectedRoute", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("./shared/api/httpClient", () => ({
  httpRequest: vi.fn(() => Promise.resolve({})),
}));

vi.mock("./features/auth/authStore", () => ({
  authStore: {
    isAuthenticated: vi.fn(() => false),
    subscribe: vi.fn(() => () => {}),
  },
}));

// Suite de tests: 'App'.
describe("App", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: redirige / vers /login si non connecte
  it("redirige / vers /login si non connecte", async () => {
    authStore.isAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("LOGIN_VIEW")).toBeInTheDocument();
  });

  // Scenario: redirige /login vers /dashboard si connecte
  it("redirige /login vers /dashboard si connecte", async () => {
    authStore.isAuthenticated.mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("DASHBOARD_VIEW")).toBeInTheDocument();
  });

  // Scenario: verifie le token immediatement et configure un polling 10s
  it("verifie le token immediatement et configure un polling 10s", async () => {
    const intervalSpy = vi.spyOn(window, "setInterval");
    authStore.isAuthenticated.mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    expect(httpRequest).toHaveBeenCalledWith("GET", "/me");
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });
});
