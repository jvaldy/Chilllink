// import "./ChannelList.css";

export default function ChannelList({
  channels,
  selectedChannelId,
  onSelect,
  disabled = false,
}) {
  if (disabled) {
    return (
      <div className="channel-list">
        <div className="channel-empty">Sélectionne un workspace</div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="channel-list">
        <div className="channel-empty">Aucun channel</div>
      </div>
    );
  }

  // Exemple simple de regroupement (tu peux l’affiner plus tard)
  const groups = {
    TEXTUEL: channels,
  };

  return (
    <div className="channel-list">
      {Object.entries(groups).map(([groupName, groupChannels]) => (
        <div key={groupName} className="channel-group">
          <div className="channel-group-title">{groupName}</div>

          {groupChannels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${
                channel.id === selectedChannelId ? "active" : ""
              }`}
              onClick={() => onSelect(channel.id)}
            >
              <span className="channel-hash">#</span>
              <span className="channel-name">{channel.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
