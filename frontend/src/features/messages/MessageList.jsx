/**
 * MessageList.jsx
 * ----------------
 * Affiche les messages dans un channel.
 */

export default function MessageList({ messages, loading, error }) {
  if (loading) {
    return <div className="empty-placeholder">Chargement des messages…</div>;
  }
  if (error) {
    return <div className="empty-placeholder">Erreur : {error}</div>;
  }
  if (messages.length === 0) {
    return <div className="empty-placeholder">Aucun message</div>;
  }
  return (
    <div className="message-list">
      {messages.map(msg => (
        <div className="message-item" key={msg.id}>
          <div className="message-author">{msg.author}</div>
          <div className="message-content">{msg.content}</div>
          <div className="message-date">{new Date(msg.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
