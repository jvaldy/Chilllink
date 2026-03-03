// Tests frontend: validation du module 'CreateChannelModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateChannelModal from "./CreateChannelModal";

// Suite de tests: 'CreateChannelModal'.
describe("CreateChannelModal", () => {
  // Scenario: cree un channel puis ferme
  it("cree un channel puis ferme", async () => {
    const onCreate = vi.fn(() => Promise.resolve());
    const onClose = vi.fn();

    render(<CreateChannelModal onCreate={onCreate} onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText(/Ex:/), {
      target: { value: "  random  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith("random"));
    expect(onClose).toHaveBeenCalled();
  });
});
