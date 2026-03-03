// Tests frontend: validation du module 'RenameWorkspaceModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RenameWorkspaceModal from "./RenameWorkspaceModal";

// Suite de tests: 'RenameWorkspaceModal'.
describe("RenameWorkspaceModal", () => {
  // Scenario: renomme puis ferme
  it("renomme puis ferme", async () => {
    const onRename = vi.fn(() => Promise.resolve());
    const onClose = vi.fn();

    render(
      <RenameWorkspaceModal
        workspace={{ id: 7, name: "Ancien" }}
        onRename={onRename}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByDisplayValue("Ancien"), { target: { value: "  Neuf  " } });
    fireEvent.click(screen.getByRole("button", { name: "Renommer" }));

    await waitFor(() => expect(onRename).toHaveBeenCalledWith(7, "Neuf"));
    expect(onClose).toHaveBeenCalled();
  });
});
