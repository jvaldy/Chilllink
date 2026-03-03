// Tests frontend: validation du module 'WorkspaceMembersModal'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkspaceMembersModal from "./WorkspaceMembersModal";
import { useWorkspaceMembers } from "./useWorkspaceMembers";

vi.mock("./useWorkspaceMembers", () => ({
  useWorkspaceMembers: vi.fn(),
}));

vi.mock("../../auth/authStore", () => ({
  authStore: { user: { id: 1 } },
}));

// Suite de tests: 'WorkspaceMembersModal'.
describe("WorkspaceMembersModal", () => {
  const inviteByEmail = vi.fn();
  const removeMember = vi.fn();

  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceMembers.mockReturnValue({
      members: [
        { id: 1, email: "self@test.dev" },
        { id: 2, email: "member@test.dev" },
      ],
      loading: false,
      submitting: false,
      error: null,
      inviteByEmail,
      removeMember,
    });
    inviteByEmail.mockResolvedValue({ success: true });
    removeMember.mockResolvedValue({ success: true });
  });

  // Scenario: invite un utilisateur
  it("invite un utilisateur", async () => {
    render(<WorkspaceMembersModal workspaceId={4} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("email@exemple.com"), {
      target: { value: "new@test.dev" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Inviter" }));

    await waitFor(() => expect(inviteByEmail).toHaveBeenCalledWith("new@test.dev"));
  });

  // Scenario: retire un membre autre que soi
  it("retire un membre autre que soi", async () => {
    render(<WorkspaceMembersModal workspaceId={4} onClose={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Retirer" })[0]);
    await waitFor(() => expect(removeMember).toHaveBeenCalledWith(2));
  });
});
