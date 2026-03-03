// Tests frontend: validation du module 'ChannelList'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChannelList from "./ChannelList";

// Suite de tests: 'ChannelList'.
describe("ChannelList", () => {
  // Scenario: selectionne un channel au clic
  it("selectionne un channel au clic", () => {
    const onSelect = vi.fn();

    render(
      <ChannelList
        channels={[
          { id: 1, name: "general" },
          { id: 2, name: "random", locked: true },
        ]}
        selectedChannelId={1}
        onSelect={onSelect}
        addChannel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /random/i }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  // Scenario: ouvre le menu et declenche les callbacks workspace
  it("ouvre le menu et declenche les callbacks workspace", () => {
    const onOpenRenameWorkspace = vi.fn();
    const onOpenWorkspaceMembers = vi.fn();
    const onOpenRemoveWorkspace = vi.fn();

    render(
      <ChannelList
        channels={[]}
        selectedChannelId={null}
        onSelect={vi.fn()}
        addChannel={vi.fn()}
        onOpenRenameWorkspace={onOpenRenameWorkspace}
        onOpenWorkspaceMembers={onOpenWorkspaceMembers}
        onOpenRemoveWorkspace={onOpenRemoveWorkspace}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));

    const workspaceButtons = screen.getAllByRole("button", { name: /Workspace/i });
    fireEvent.click(workspaceButtons[0]);
    expect(onOpenRenameWorkspace).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Workspace/i })[1]);
    expect(onOpenWorkspaceMembers).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Workspace/i })[2]);
    expect(onOpenRemoveWorkspace).toHaveBeenCalled();
  });
});
