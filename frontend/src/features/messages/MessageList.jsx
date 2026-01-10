// import "./MessageList.css";

export default function MessageList({ messages, loading, error }) {
  if (loading) {
    return (
      <div className="message-list">
        <div className="empty-placeholder">Chargement des messages…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-list">
        <div className="empty-placeholder">Erreur lors du chargement</div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-placeholder">Aucun message pour le moment</div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className="message-item">
          {/* Avatar */}
          <div className="message-avatar">
            {message.author?.email?.[0] ?? "?"}
          </div>

          {/* Content */}
          <div className="message-body">
            <div className="message-header">
              <span className="message-author">
                {message.author?.email ?? "Utilisateur"}
              </span>
              <span className="message-date">
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="message-content">
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
