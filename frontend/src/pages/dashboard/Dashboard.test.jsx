// Tests frontend: validation du module 'Dashboard'.
// Ces cas couvrent les comportements attendus, y compris les erreurs metier.

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import { authStore } from "../../features/auth/authStore";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../features/auth/authStore", () => ({
  authStore: {
    clear: vi.fn(),
    user: { id: 1, email: "self@test.dev" },
  },
}));

vi.mock("../../features/workspaces/useWorkspaces", () => ({
  useWorkspaces: () => ({
    workspaces: [{ id: 1, name: "WS" }],
    selectedWorkspaceId: 1,
    setSelectedWorkspaceId: vi.fn(),
    addWorkspace: vi.fn(),
    removeWorkspace: vi.fn(),
    renameWorkspace: vi.fn(),
  }),
}));

vi.mock("../../features/channels/useChannels", () => ({
  useChannels: () => ({
    channels: [{ id: 10, name: "general" }],
    selectedChannelId: 10,
    setSelectedChannelId: vi.fn(),
    addChannel: vi.fn(),
    renameChannel: vi.fn(),
    removeChannel: vi.fn(),
  }),
}));

vi.mock("../../features/messages/useMessages", () => ({
  useMessages: () => ({
    messages: [{ id: 1, content: "hi", author: { email: "self@test.dev" } }],
    typingUsers: [],
    loading: false,
    error: null,
    locked: false,
    sendMessage: vi.fn(),
  }),
}));

vi.mock("../../features/workspaces/WorkspaceList", () => ({
  default: () => <div>WORKSPACE_LIST</div>,
}));
vi.mock("../../features/channels/ChannelList", () => ({
  default: () => <div>CHANNEL_LIST</div>,
}));
vi.mock("../../features/messages/MessageList", () => ({
  default: () => <div>MESSAGE_LIST</div>,
}));
vi.mock("../../features/messages/MessageComposer", () => ({
  default: () => <div>MESSAGE_COMPOSER</div>,
}));
vi.mock("../../features/messages/TypingIndicator", () => ({
  default: () => <div>TYPING_INDICATOR</div>,
}));
vi.mock("../../features/workspaces/members/WorkspaceMembersModal", () => ({
  default: () => <div>WS_MEMBERS_MODAL</div>,
}));
vi.mock("../../features/channels/ChannelMembersModal", () => ({
  default: () => <div>CHANNEL_MEMBERS_MODAL</div>,
}));
vi.mock("../../features/profile/ProfileModal", () => ({
  default: () => <div>PROFILE_MODAL</div>,
}));
vi.mock("../../features/workspaces/RemoveWorkspaceModal", () => ({
  default: () => <div>REMOVE_WS_MODAL</div>,
}));
vi.mock("../../features/workspaces/RenameWorkspaceModal", () => ({
  default: () => <div>RENAME_WS_MODAL</div>,
}));

// Suite de tests: 'Dashboard'.
describe("Dashboard", () => {
  // Preparation commune avant chaque scenario.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario: affiche la structure principale
  it("affiche la structure principale", () => {
    render(<Dashboard />);
    expect(screen.getByText("WORKSPACE_LIST")).toBeInTheDocument();
    expect(screen.getByText("CHANNEL_LIST")).toBeInTheDocument();
    expect(screen.getByText("MESSAGE_LIST")).toBeInTheDocument();
  });

  // Scenario: deconnecte puis redirige login
  it("deconnecte puis redirige login", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Mon compte/i }));
    fireEvent.click(screen.getByRole("button", { name: /connexion/i }));

    expect(authStore.clear).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
  });
});
