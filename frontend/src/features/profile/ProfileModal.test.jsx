// Tests frontend: validation du module 'ProfileModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileModal from "./ProfileModal";
import { getProfile, patchProfile } from "./profileService";

vi.mock("./profileService", () => ({
  getProfile: vi.fn(),
  patchProfile: vi.fn(),
}));

// Suite de tests: 'ProfileModal'.
describe("ProfileModal", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: charge le profil puis sauvegarde
  it("charge le profil puis sauvegarde", async () => {
    getProfile.mockResolvedValueOnce({
      firstName: "Ada",
      lastName: "Lovelace",
      birthDate: "2020-01-02",
      phone: "",
      city: "",
      country: "",
      bio: "",
    });
    patchProfile.mockResolvedValueOnce({ firstName: "Ada" });

    const { container } = render(<ProfileModal onClose={vi.fn()} />);
    expect(await screen.findByDisplayValue("Ada")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Ada"), { target: { value: "  Ada  " } });
    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));

    await waitFor(() =>
      expect(patchProfile).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: "Ada", lastName: "Lovelace" })
      )
    );
    await waitFor(() =>
      expect(container.querySelector(".profile-alert.ok")).toBeInTheDocument()
    );
  });

  // Scenario: affiche une erreur de chargement
  it("affiche une erreur de chargement", async () => {
    getProfile.mockRejectedValueOnce(new Error("boom"));
    render(<ProfileModal onClose={vi.fn()} />);
    expect(await screen.findByText("boom")).toBeInTheDocument();
  });
});
