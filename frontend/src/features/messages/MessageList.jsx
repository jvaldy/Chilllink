export default function MessageList({ messages }) {
  return (
    <div className="message-list">
      {messages.map((message) => {
        const date = message.createdAt
          ? new Date(message.createdAt).toLocaleString()
          : '';

        return (
          <div key={message.id} className="message">
            <div className="message-header">
              <strong>{message.author.email}</strong>
              <span className="message-date">{date}</span>
            </div>

            <div className="message-content">
              {message.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
