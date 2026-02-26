import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { authStore } from "../../features/auth/authStore";

import { useWorkspaces } from "../../features/workspaces/useWorkspaces";
import WorkspaceList from "../../features/workspaces/WorkspaceList";
import RemoveWorkspaceModal from "../../features/workspaces/RemoveWorkspaceModal";
import RenameWorkspaceModal from "../../features/workspaces/RenameWorkspaceModal";

import { useChannels } from "../../features/channels/useChannels";
import ChannelList from "../../features/channels/ChannelList";

import { useMessages } from "../../features/messages/useMessages";
import MessageList from "../../features/messages/MessageList";
import MessageComposer from "../../features/messages/MessageComposer";
import TypingIndicator from "../../features/messages/TypingIndicator";

import WorkspaceMembersModal from "../../features/workspaces/members/WorkspaceMembersModal";
import ChannelMembersModal from "../../features/channels/ChannelMembersModal";
import ProfileModal from "../../features/profile/ProfileModal";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [workspaceMembersOpen, setWorkspaceMembersOpen] = useState(false);
  const [channelMembersOpen, setChannelMembersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [removeWorkspaceOpen, setRemoveWorkspaceOpen] = useState(false);
  const [renameWorkspaceOpen, setRenameWorkspaceOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    addWorkspace,
    removeWorkspace,
    renameWorkspace,
  } = useWorkspaces();

  const currentWorkspace = workspaces.find(
    (w) => w.id === selectedWorkspaceId
  );

  const {
    channels,
    selectedChannelId,
    setSelectedChannelId,
    addChannel,
    renameChannel,
    removeChannel,
  } = useChannels(selectedWorkspaceId);

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

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target)) setAccountOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="app-wrapper">

      {/* HEADER */}
      <div className="global-header">
        <div className="global-left">
          <div className="global-logo">
            <img
              src="/logo_chilllink.png"
              alt="Chilllink Logo"
              className="logo-img"
            />
            <span className="logo-text">Chilllink</span>
          </div>
        </div>

        <div className="global-right">
          <div className="account-menu" ref={accountRef}>
            <button
              className="global-btn"
              onClick={() => setAccountOpen((v) => !v)}
            >
              👤 Mon compte ▾
            </button>

            {accountOpen && (
              <div className="account-dropdown">
                <button
                  className="account-item"
                  onClick={() => {
                    setAccountOpen(false);
                    setProfileOpen(true);
                  }}
                >
                  👤 Profil
                </button>

                <button
                  className="account-item danger"
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APP */}
      <div className="chat-app">

        <aside className="workspace-bar">
          <WorkspaceList
            workspaces={workspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelect={setSelectedWorkspaceId}
            addWorkspace={addWorkspace}
          />
        </aside>

        <aside className="channel-container">
          <ChannelList
            disabled={!selectedWorkspaceId}
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelect={setSelectedChannelId}
            addChannel={addChannel}
            onOpenWorkspaceMembers={() => setWorkspaceMembersOpen(true)}
            onOpenRemoveWorkspace={() => setRemoveWorkspaceOpen(true)}
            onOpenRenameWorkspace={() => setRenameWorkspaceOpen(true)}
          />
        </aside>

        <main className="chat-container">
          <div className="chat-header">
            <span className="chat-header-title">
              {currentChannel ? `# ${currentChannel.name}` : "Chilllink"}
            </span>

            {selectedWorkspaceId && selectedChannelId && (
              <button
                className="chat-header-btn"
                onClick={() => setChannelMembersOpen(true)}
              >
                🔒 Channel
              </button>
            )}
          </div>

          {currentChannel ? (
            <>
              {locked ? (
                <div className="empty-chat">
                  🔒 Channel verrouillé
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    loading={loading}
                    error={error}
                    currentUserEmail={authStore.user?.email || ""}
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
        </main>
      </div>

      {/* MODALS */}

      {channelMembersOpen && selectedWorkspaceId && currentChannel && (
        <ChannelMembersModal
          workspaceId={selectedWorkspaceId}
          channel={currentChannel}
          renameChannel={renameChannel}
          removeChannel={removeChannel}
          onClose={() => setChannelMembersOpen(false)}
        />
      )}

      {workspaceMembersOpen && selectedWorkspaceId && (
        <WorkspaceMembersModal
          workspaceId={selectedWorkspaceId}
          onClose={() => setWorkspaceMembersOpen(false)}
        />
      )}

      {removeWorkspaceOpen && currentWorkspace && (
        <RemoveWorkspaceModal
          workspace={currentWorkspace}
          onConfirm={removeWorkspace}
          onClose={() => setRemoveWorkspaceOpen(false)}
        />
      )}

      {renameWorkspaceOpen && currentWorkspace && (
        <RenameWorkspaceModal
          workspace={currentWorkspace}
          onRename={renameWorkspace}
          onClose={() => setRenameWorkspaceOpen(false)}
        />
      )}

      {profileOpen && (
        <ProfileModal onClose={() => setProfileOpen(false)} />
      )}

    </div>
  );
}