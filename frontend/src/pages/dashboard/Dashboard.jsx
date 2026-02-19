import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authStore } from "../../features/auth/authStore";

/* WORKSPACES */
import { useWorkspaces } from "../../features/workspaces/useWorkspaces";
import WorkspaceList from "../../features/workspaces/WorkspaceList";

/* CHANNELS */
import { useChannels } from "../../features/channels/useChannels";
import ChannelList from "../../features/channels/ChannelList";

/* MESSAGES */
import { useMessages } from "../../features/messages/useMessages";
import MessageList from "../../features/messages/MessageList";
import MessageComposer from "../../features/messages/MessageComposer";
import TypingIndicator from "../../features/messages/TypingIndicator";

/* MEMBERS */
import WorkspaceMembersModal from "../../features/workspaces/members/WorkspaceMembersModal";
import ChannelMembersModal from "../../features/channels/ChannelMembersModal"; 

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ États séparés
  const [workspaceMembersOpen, setWorkspaceMembersOpen] = useState(false);
  const [channelMembersOpen, setChannelMembersOpen] = useState(false);

  /* WORKSPACES */
  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    addWorkspace,
  } = useWorkspaces();

  /* CHANNELS */
  const {
    channels,
    selectedChannelId,
    setSelectedChannelId,
    addChannel,
  } = useChannels(selectedWorkspaceId);

  /* MESSAGES */
  const {
    messages,
    typingUsers,
    loading,
    error,
    locked,
    sendMessage,
  } = useMessages(selectedChannelId);

  const currentChannel = channels.find(
    (c) => c.id === selectedChannelId
  );

  const logout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="chat-app">

      {/* ================= WORKSPACES ================= */}
      <aside className="workspace-bar">
        <WorkspaceList
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onSelect={setSelectedWorkspaceId}
          addWorkspace={addWorkspace}
        />
      </aside>

      {/* ================= CHANNELS ================= */}
      <aside className="channel-container">
        <ChannelList
          disabled={!selectedWorkspaceId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelect={setSelectedChannelId}
          addChannel={addChannel}
        />
      </aside>

      {/* ================= CHAT ================= */}
      <main className="chat-container">

        {/* ================= HEADER ================= */}
        <div className="chat-header">
          <div className="chat-header-left">
            <span className="chat-header-title">
              {currentChannel ? `# ${currentChannel.name}` : "Chilllink"}
            </span>
          </div>

          <div className="chat-header-actions">

            {/* 👥 Membres du Workspace */}
            {selectedWorkspaceId && (
              <button
                className="chat-header-btn"
                onClick={() => setWorkspaceMembersOpen(true)}
              >
                👥 Workspace
              </button>
            )}

            {/* 🔒 Membres du Channel */}
            {selectedWorkspaceId && selectedChannelId && (
              <button
                className="chat-header-btn"
                onClick={() => setChannelMembersOpen(true)}
              >
                🔒 Channel
              </button>
            )}

            <button
              onClick={logout}
              className="chat-logout-btn"
            >
              Logout
            </button>

          </div>
        </div>

        {/* ================= CONTENU CHAT ================= */}
        {currentChannel ? (
          <>
            {locked ? (
              <div className="empty-chat">
                <div style={{ fontSize: 18, marginBottom: 8 }}>
                  🔒 Channel verrouillé
                </div>
                <div style={{ opacity: 0.8 }}>
                  Tu vois ce channel car tu es membre du workspace,
                  mais tu n’as pas encore accès aux messages.
                  Demande au owner de t’ajouter au channel.
                </div>
              </div>
            ) : (
              <>
                <MessageList
                  messages={messages}
                  loading={loading}
                  error={error}
                />
                <TypingIndicator users={typingUsers} />
              </>
            )}

            <MessageComposer
              onSend={sendMessage}
              channelId={selectedChannelId}
              disabled={locked}
            />
          </>
        ) : (
          <div className="empty-chat">
            Sélectionne un channel
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* Workspace Members */}
        {workspaceMembersOpen && selectedWorkspaceId && (
          <WorkspaceMembersModal
            workspaceId={selectedWorkspaceId}
            onClose={() => setWorkspaceMembersOpen(false)}
          />
        )}

        {/* Channel Members */}
        {channelMembersOpen &&
          selectedWorkspaceId &&
          selectedChannelId && (
            <ChannelMembersModal
              workspaceId={selectedWorkspaceId}
              channelId={selectedChannelId}
              onClose={() => setChannelMembersOpen(false)}
            />
          )}

      </main>
    </div>
  );
}
