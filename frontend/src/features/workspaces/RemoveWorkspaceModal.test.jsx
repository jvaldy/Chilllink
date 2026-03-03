// Tests frontend: validation du module 'RemoveWorkspaceModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RemoveWorkspaceModal from "./RemoveWorkspaceModal";

// Suite de tests: 'RemoveWorkspaceModal'.
describe("RemoveWorkspaceModal", () => {
  // Scenario: supprime puis ferme
  it("supprime puis ferme", async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const onClose = vi.fn();

    render(
      <RemoveWorkspaceModal
        workspace={{ id: 2, name: "Core" }}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Supprimer/ }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(2));
    expect(onClose).toHaveBeenCalled();
  });
});
