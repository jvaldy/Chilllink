// Tests frontend: validation du module 'MessageList'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import MessageList from "./MessageList";

// Suite de tests: 'MessageList'.
describe("MessageList", () => {
  beforeAll(() => {
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
  });

  // Scenario: affiche les etats loading/error/empty
  it("affiche les etats loading/error/empty", () => {
    const { rerender } = render(<MessageList loading messages={[]} />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();

    rerender(<MessageList loading={false} error="Oops" messages={[]} />);
    expect(screen.getByText(/Erreur : Oops/)).toBeInTheDocument();

    rerender(<MessageList loading={false} error={null} messages={[]} />);
    expect(screen.getByText(/Aucun message/i)).toBeInTheDocument();
  });

  // Scenario: affiche les groupes de messages et l'auteur courant
  it("affiche les groupes de messages et l'auteur courant", () => {
    const now = new Date().toISOString();
    render(
      <MessageList
        currentUserEmail="me@test.dev"
        messages={[
          { id: 1, content: "Salut", createdAt: now, author: { email: "me@test.dev" } },
          { id: 2, content: "Hey", createdAt: now, author: { email: "other@test.dev" } },
        ]}
      />
    );

    expect(screen.getByText("Salut")).toBeInTheDocument();
    expect(screen.getByText("Hey")).toBeInTheDocument();
    expect(screen.getByText("Vous")).toBeInTheDocument();
  });
});
