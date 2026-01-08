import { useNavigate } from "react-router-dom";

/* AUTH */
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

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspaces();

  const {
    channels,
    selectedChannelId,
    setSelectedChannelId,
  } = useChannels(selectedWorkspaceId);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useMessages(selectedChannelId);

  const currentChannel = channels.find(c => c.id === selectedChannelId);

  const handleLogout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="chat-app">

      {/* ================= WORKSPACE BAR ================= */}
      <aside className="workspace-bar">
        <WorkspaceList
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onSelect={setSelectedWorkspaceId}
        />
        <button className="workspace-logout" onClick={handleLogout}>
          🚪
        </button>
      </aside>

      {/* ================= CHANNEL LIST ================= */}
      <aside className="channel-container">
        <div className="channel-header-section">
          <h2>Channels</h2>
        </div>
        <ChannelList
          disabled={!selectedWorkspaceId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelect={setSelectedChannelId}
        />
      </aside>

      {/* ================= CHAT AREA ================= */}
      <main className="chat-container">

        {/* Channel Title */}
        <div className="chat-header">
          {currentChannel ? (
            <>
              <span className="hash">#</span>
              <span className="channel-title">{currentChannel.name}</span>
            </>
          ) : (
            <span className="no-channel">Choisis un channel</span>
          )}
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          loading={messagesLoading}
          error={messagesError}
        />

        {/* Composer */}
        {currentChannel && (
          <div className="composer-wrapper">
            <MessageComposer onSend={sendMessage} />
          </div>
        )}
      </main>
    </div>
  );
}
