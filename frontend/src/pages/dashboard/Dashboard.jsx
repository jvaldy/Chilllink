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
        {/* Home Button */}
        <div className="workspace-home">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>

        {/* Separator */}
        <div className="workspace-separator"></div>

        {/* Workspace List */}
        <WorkspaceList
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onSelect={setSelectedWorkspaceId}
        />

        {/* Spacer */}
        <div className="workspace-spacer"></div>

        {/* Logout Button */}
        <button className="workspace-logout" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </aside>

      {/* ================= CHANNEL LIST ================= */}
      <aside className="channel-container">
        {/* Server Header */}
        <div className="channel-header-section">
          <span className="channel-header-title">Workspace</span>
          <svg className="channel-header-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>

        {/* Channels */}
        <ChannelList
          disabled={!selectedWorkspaceId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelect={setSelectedChannelId}
        />

        {/* User Panel */}
        <div className="user-panel">
          <div className="user-avatar">U</div>
          <div className="user-info">
            <div className="user-name">Username</div>
            <div className="user-status">En ligne</div>
          </div>
          <svg className="user-settings" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.196-13.196l-4.242 4.242m0 5.658l4.242 4.242M23 12h-6m-6 0H1m13.196 5.196l-4.242-4.242m0-5.658l4.242-4.242"/>
          </svg>
        </div>
      </aside>

      {/* ================= CHAT AREA ================= */}
      <main className="chat-container">

        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            {currentChannel ? (
              <>
                <svg className="hash-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.887 21a.5.5 0 0 1-.493-.582L6 17H2.595a.5.5 0 0 1-.492-.586l.175-1A.5.5 0 0 1 2.77 15h3.58l1.06-6H4.005a.5.5 0 0 1-.492-.586l.175-1A.5.5 0 0 1 4.18 7h3.58l.637-3.582A.5.5 0 0 1 8.889 3h1.005a.5.5 0 0 1 .493.582L9.78 7h6l.637-3.582A.5.5 0 0 1 16.889 3h1.005a.5.5 0 0 1 .493.582L17.78 7h3.405a.5.5 0 0 1 .492.586l-.175 1A.5.5 0 0 1 21.01 9h-3.58l-1.06 6h3.405a.5.5 0 0 1 .492.586l-.175 1a.5.5 0 0 1-.492.414h-3.58l-.637 3.582a.5.5 0 0 1-.492.418h-1.005a.5.5 0 0 1-.493-.582L14.22 17h-6l-.637 3.582a.5.5 0 0 1-.492.418H5.887zM9.06 9l-1.06 6h6l1.06-6h-6z"/>
                </svg>
                <span className="channel-title">{currentChannel.name}</span>
              </>
            ) : (
              <span className="no-channel">Sélectionne un channel</span>
            )}
          </div>
          {currentChannel && (
            <div className="chat-header-actions">
              <svg className="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              <svg className="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
              </svg>
              <svg className="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <svg className="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
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
            <MessageComposer onSend={sendMessage} channelName={currentChannel.name} />
          </div>
        )}
      </main>
    </div>
  );
}