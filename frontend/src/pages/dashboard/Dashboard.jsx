import { useNavigate } from "react-router-dom";
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

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

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

  const currentChannel = channels.find((c) => c.id === selectedChannelId);

  const logout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="chat-app">
      {/* WORKSPACES */}
      <aside className="workspace-bar">
        <WorkspaceList
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onSelect={setSelectedWorkspaceId}
          addWorkspace={addWorkspace}
        />

        <button onClick={logout} className="workspace-logout">
          Logout
        </button>
      </aside>

      {/* CHANNELS */}
      <aside className="channel-container">
        <ChannelList
          disabled={!selectedWorkspaceId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelect={setSelectedChannelId}
          addChannel={addChannel}
        />
      </aside>

      {/* CHAT */}
      <main className="chat-container">
        {currentChannel ? (
          <>
            {locked ? (
              <div className="empty-chat">
                <div style={{ fontSize: 18, marginBottom: 8 }}>🔒 Channel verrouillé</div>
                <div style={{ opacity: 0.8 }}>
                  Tu vois ce channel car tu es membre du workspace, mais tu n’as pas encore accès
                  aux messages. Demande au owner de t’ajouter au channel.
                </div>
              </div>
            ) : (
              <>
                <MessageList messages={messages} loading={loading} error={error} />
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
          <div className="empty-chat">Sélectionne un channel</div>
        )}
      </main>
    </div>
  );
}
