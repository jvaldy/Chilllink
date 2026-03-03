// Tests frontend: validation du module 'TypingIndicator'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TypingIndicator from "./TypingIndicator";

// Suite de tests: 'TypingIndicator'.
describe("TypingIndicator", () => {
  // Scenario: n'affiche rien sans utilisateurs
  it("n'affiche rien sans utilisateurs", () => {
    const { container } = render(<TypingIndicator users={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  // Scenario: affiche le libelle singulier et pluriel
  it("affiche le libelle singulier et pluriel", () => {
    const { rerender } = render(<TypingIndicator users={[{ username: "Ada" }]} />);
    expect(screen.getByText(/Ada/)).toBeInTheDocument();

    rerender(<TypingIndicator users={[{ username: "Ada" }, { username: "Bob" }]} />);
    expect(screen.getByText(/Ada, Bob/)).toBeInTheDocument();
  });
});
