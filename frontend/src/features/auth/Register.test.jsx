// Tests frontend: validation du module 'Register'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";
import { registerUser } from "./authService";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("./authService", () => ({
  registerUser: vi.fn(),
}));

// Suite de tests: 'Register'.
describe("Register", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: affiche un succes apres inscription
  it("affiche un succes apres inscription", async () => {
    registerUser.mockResolvedValueOnce({ success: true, data: { id: 1 } });
    const { container } = render(<Register />);

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: "u@test.dev" } });
    fireEvent.change(passwordInput, { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button", { name: "S'inscrire" }).closest("form"));

    expect(await screen.findByText(/Compte/)).toBeInTheDocument();
  });

  // Scenario: affiche une erreur si API refuse
  it("affiche une erreur si API refuse", async () => {
    registerUser.mockResolvedValueOnce({ success: false, error: "Email pris" });
    const { container } = render(<Register />);

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: "u@test.dev" } });
    fireEvent.change(passwordInput, { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button", { name: "S'inscrire" }).closest("form"));

    expect(await screen.findByText("Email pris")).toBeInTheDocument();
  });
});
