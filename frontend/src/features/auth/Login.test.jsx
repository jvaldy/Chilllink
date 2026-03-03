// Tests frontend: validation du module 'Login'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";
import { loginUser } from "./authService";
import { authStore } from "./authStore";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("./authService", () => ({
  loginUser: vi.fn(),
}));

vi.mock("./authStore", () => ({
  authStore: {
    setToken: vi.fn(),
  },
}));

// Suite de tests: 'Login'.
describe("Login", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: connecte puis redirige vers dashboard
  it("connecte puis redirige vers dashboard", async () => {
    loginUser.mockResolvedValueOnce({ success: true, token: "jwt" });
    const { container } = render(<Login />);

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: "u@test.dev" } });
    fireEvent.change(passwordInput, { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form"));

    await waitFor(() => expect(authStore.setToken).toHaveBeenCalledWith("jwt"));
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  // Scenario: affiche une erreur si login echoue
  it("affiche une erreur si login echoue", async () => {
    loginUser.mockResolvedValueOnce({ success: false, error: "Bad creds" });
    const { container } = render(<Login />);

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: "u@test.dev" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.submit(screen.getByRole("button", { name: "Se connecter" }).closest("form"));

    expect(await screen.findByText("Bad creds")).toBeInTheDocument();
  });
});
