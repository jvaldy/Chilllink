import { useEffect, useMemo, useRef } from "react";
import "./Message.css";

function getInitials(email = "") {
  return (email?.trim()?.[0] || "?").toUpperCase();
}

function getAvatarColor(email = "") {
  const palette = [
    ["#4f6ef7", "#0c102e"],
    ["#22c97a", "#062015"],
    ["#a855f7", "#1d0630"],
    ["#ff8a3d", "#041b24"],
    ["#f59e0b", "#2a1a00"],
  ];

  let hashValue = 0;
  for (let index = 0; index < email.length; index++) {
    hashValue = email.charCodeAt(index) + ((hashValue << 5) - hashValue);
  }

  const selected = palette[Math.abs(hashValue) % palette.length];
  const background = selected[0];
  const color = selected[1];

  return { background, color };
}

function formatTime(dateString) {
  if (!dateString) return "";
  const dateObject = new Date(dateString);
  return dateObject.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateString) {
  if (!dateString) return "";
  const dateObject = new Date(dateString);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateObject.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (dateObject.toDateString() === yesterday.toDateString()) return "Hier";

  return dateObject.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MessageList({
  messages = [],
  loading = false,
  error = null,
  currentUserEmail = "",
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedItems = useMemo(() => {
    const output = [];
    let lastDateKey = null;

    for (const message of messages) {
      const messageDateKey = message?.createdAt
        ? new Date(message.createdAt).toDateString()
        : null;

      if (messageDateKey && messageDateKey !== lastDateKey) {
        output.push({ type: "separator", date: message.createdAt });
        lastDateKey = messageDateKey;
      }

      const authorEmail = message?.author?.email || "unknown";
      const lastItem = output[output.length - 1];

      if (lastItem && lastItem.type === "group" && lastItem.email === authorEmail) {
        lastItem.messages.push(message);
      } else {
        output.push({ type: "group", email: authorEmail, messages: [message] });
      }
    }

    return output;
  }, [messages]);

  if (loading) return <div className="msg-list-status">Chargement…</div>;
  if (error) return <div className="msg-list-status">Erreur : {error}</div>;
  if (!messages.length) return <div className="msg-list-status">Aucun message</div>;

  return (
    <div className="message-list-wrap">
      {groupedItems.map((groupItem, groupIndex) => {
        if (groupItem.type === "separator") {
          return (
            <div key={`separator-${groupIndex}`} className="date-sep">
              <span>{formatDateLabel(groupItem.date)}</span>
            </div>
          );
        }

        const isSelfGroup = groupItem.email === currentUserEmail;
        const avatarStyle = getAvatarColor(groupItem.email);

        return (
          <div
            key={`group-${groupIndex}`}
            className={`msg-group ${isSelfGroup ? "self" : "other"}`}
          >
            <div className="msg-group-header">
              <span className="msg-author">{isSelfGroup ? "Vous" : groupItem.email}</span>
              <span className="msg-time-group">
                {formatTime(groupItem.messages[0]?.createdAt)}
              </span>
            </div>

            {groupItem.messages.map((message, messageIndex) => {
              const isLastInGroup = messageIndex === groupItem.messages.length - 1;

              return (
                <div
                  key={message.id}
                  className="msg-row"
                  style={{ animationDelay: `${messageIndex * 0.035}s` }}
                >
                  <div
                    className={`msg-avatar ${!isLastInGroup ? "hidden" : ""} ${
                      isSelfGroup ? "self" : ""
                    }`}
                    style={!isSelfGroup ? avatarStyle : undefined}
                    title={groupItem.email}
                  >
                    {getInitials(groupItem.email)}
                  </div>

                  <div className="msg-bubble">{message.content}</div>

                  <span className="msg-time">{formatTime(message.createdAt)}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}