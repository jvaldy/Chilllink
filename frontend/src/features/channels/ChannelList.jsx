/**
 * ChannelList.jsx
 * --------------
 * Liste des channels d’un workspace + sélection.
 */

export default function ChannelList({
  channels,
  selectedChannelId,
  onSelect,
  loading,
  error,
  disabled = false,
}) {
  if (disabled) {
    return <div className="sidebar-item">Sélectionnez un workspace</div>;
  }

  if (loading) {
    return <div className="sidebar-item">Chargement des channels...</div>;
  }

  if (error) {
    return <div className="sidebar-item error">Erreur : {error}</div>;
  }

  if (channels.length === 0) {
    return <div className="sidebar-item">Aucun channel</div>;
  }

  return (
    <>
      {channels.map((ch) => (
        <div
          key={ch.id}
          className={`sidebar-item ${ch.id === selectedChannelId ? "active" : ""}`}
          onClick={() => onSelect(ch.id)}
        >
          <span className="icon">#️⃣</span>
          {ch.name}
        </div>
      ))}
    </>
  );
}
