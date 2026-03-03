// Tests frontend: validation du module 'MessageComposer'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MessageComposer from "./MessageComposer";
import { useTyping } from "./useTyping";

vi.mock("./useTyping", () => ({
  useTyping: vi.fn(),
}));

vi.mock("../auth/authStore", () => ({
  authStore: {
    user: { id: 1, email: "self@test.dev" },
  },
}));

// Suite de tests: 'MessageComposer'.
describe("MessageComposer", () => {
  const notifyTyping = vi.fn();

  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
    useTyping.mockReturnValue({ notifyTyping });
  });

  // Scenario: envoie un message au submit
  it("envoie un message au submit", async () => {
    const onSend = vi.fn(() => Promise.resolve());
    render(<MessageComposer onSend={onSend} channelId={9} />);

    fireEvent.change(screen.getByPlaceholderText(/message/i), {
      target: { value: " Salut " },
    });
    fireEvent.click(screen.getByRole("button", { name: "➤" }));

    await waitFor(() => expect(onSend).toHaveBeenCalledWith("Salut"));
  });

  // Scenario: declenche notifyTyping pendant la saisie
  it("declenche notifyTyping pendant la saisie", () => {
    render(<MessageComposer onSend={vi.fn()} channelId={9} />);
    fireEvent.change(screen.getByPlaceholderText(/message/i), {
      target: { value: "x" },
    });
    expect(notifyTyping).toHaveBeenCalled();
  });

  // Scenario: desactive le champ en mode verrouille
  it("desactive le champ en mode verrouille", () => {
    render(<MessageComposer onSend={vi.fn()} channelId={9} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
