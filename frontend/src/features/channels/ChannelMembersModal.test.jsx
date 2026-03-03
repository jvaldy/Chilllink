// Tests frontend: validation du module 'ChannelMembersModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChannelMembersModal from "./ChannelMembersModal";
import { useChannelMembers } from "./useChannelMembers";

vi.mock("./useChannelMembers", () => ({
  useChannelMembers: vi.fn(),
}));

// Suite de tests: 'ChannelMembersModal'.
describe("ChannelMembersModal", () => {
  const add = vi.fn();
  const remove = vi.fn();
  const renameChannel = vi.fn();
  const removeChannel = vi.fn();
  const onClose = vi.fn();

  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    useChannelMembers.mockReturnValue({
      members: [
        { id: 2, email: "b@test.dev" },
        { id: 1, email: "a@test.dev" },
      ],
      loading: false,
      add,
      remove,
    });
    add.mockResolvedValue(undefined);
    remove.mockResolvedValue(undefined);
    renameChannel.mockResolvedValue(undefined);
    removeChannel.mockResolvedValue(undefined);
  });

  // Scenario: renomme, ajoute et retire des membres
  it("renomme, ajoute et retire des membres", async () => {
    render(
      <ChannelMembersModal
        workspaceId={7}
        channel={{ id: 8, name: "general" }}
        renameChannel={renameChannel}
        removeChannel={removeChannel}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByDisplayValue("general"), { target: { value: "new-name" } });
    fireEvent.click(screen.getByRole("button", { name: "Renommer" }));
    await waitFor(() => expect(renameChannel).toHaveBeenCalledWith(8, "new-name"));

    fireEvent.change(screen.getByPlaceholderText("email@exemple.com"), {
      target: { value: "new@test.dev" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    await waitFor(() => expect(add).toHaveBeenCalledWith("new@test.dev"));

    fireEvent.click(screen.getAllByRole("button", { name: "Retirer" })[0]);
    await waitFor(() => expect(remove).toHaveBeenCalled());
  });

  // Scenario: supprime le channel et ferme
  it("supprime le channel et ferme", async () => {
    render(
      <ChannelMembersModal
        workspaceId={7}
        channel={{ id: 8, name: "general" }}
        renameChannel={renameChannel}
        removeChannel={removeChannel}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Supprimer le channel/i }));
    await waitFor(() => expect(removeChannel).toHaveBeenCalledWith(8));
    expect(onClose).toHaveBeenCalled();
  });
});
