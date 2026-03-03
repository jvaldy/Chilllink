// Tests frontend: validation du module 'CreateWorkspaceModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

// Suite de tests: 'CreateWorkspaceModal'.
describe("CreateWorkspaceModal", () => {
  // Scenario: soumet un nom nettoye puis ferme la modal
  it("soumet un nom nettoye puis ferme la modal", async () => {
    const onCreate = vi.fn(() => Promise.resolve());
    const onClose = vi.fn();

    render(<CreateWorkspaceModal onCreate={onCreate} onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText("Ex: Projet Chilllink"), {
      target: { value: "  Projet X  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith("Projet X"));
    expect(onClose).toHaveBeenCalled();
  });

  // Scenario: ferme sur click backdrop
  it("ferme sur click backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <CreateWorkspaceModal onCreate={vi.fn()} onClose={onClose} />
    );
    fireEvent.mouseDown(container.querySelector(".cl-modal-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });
});
