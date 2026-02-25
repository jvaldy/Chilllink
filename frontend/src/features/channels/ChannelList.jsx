import { useEffect, useRef, useState } from "react";
import "./Channel.css";
import CreateChannelModal from "./CreateChannelModal";

export default function ChannelList({
  channels,
  selectedChannelId,
  onSelect,
  addChannel,
  disabled = false,
  onOpenWorkspaceMembers,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <div className="channel-topbar">
        <div className="channel-topbar-title">CHANNELS</div>

        <div className="channel-menu" ref={menuRef}>
          <button
            type="button"
            className="channel-menu-btn"
            disabled={disabled}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰ Menu ▾
          </button>

          {menuOpen && !disabled && (
            <div className="channel-menu-dropdown">
              <button
                type="button"
                className="channel-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setIsCreateOpen(true);
                }}
              >
                ➕ Channel
              </button>

              <button
                type="button"
                className="channel-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenWorkspaceMembers?.();
                }}
              >
                👥 Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="channel-list">
        {channels.map((channel) => {
          const isLocked =
            channel.locked === true ||
            channel.isMember === false;

          const isActive = channel.id === selectedChannelId;

          return (
            <button
              key={channel.id}
              type="button"
              className={`channel-item ${
                isActive ? "active" : ""
              } ${isLocked ? "locked" : ""}`}
              onClick={() => onSelect(channel.id)}
              title={isLocked ? "Accès restreint" : channel.name}
            >
              <div className="channel-left">
                <span className="channel-hash">
                  {isLocked ? "🔒" : "#"}
                </span>

                <span className="channel-name">
                  {channel.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {isCreateOpen && !disabled && (
        <CreateChannelModal
          onCreate={addChannel}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}