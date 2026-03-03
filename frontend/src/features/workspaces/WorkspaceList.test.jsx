// Tests frontend: validation du module 'WorkspaceList'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspaceList from "./WorkspaceList";

// Suite de tests: 'WorkspaceList'.
describe("WorkspaceList", () => {
  // Scenario: affiche les initiales et declenche onSelect
  it("affiche les initiales et declenche onSelect", () => {
    const onSelect = vi.fn();
    render(
      <WorkspaceList
        workspaces={[
          { id: 1, name: "alpha" },
          { id: 2, name: "beta" },
        ]}
        selectedWorkspaceId={1}
        onSelect={onSelect}
        addWorkspace={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
