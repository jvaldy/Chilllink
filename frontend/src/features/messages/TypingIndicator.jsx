/**
 * TypingIndicator.jsx
 * -------------------
 * Affiche "X est en train d’écrire…"
 */

export default function TypingIndicator({ users = [] }) {
  if (!users.length) return null;

  const usernames = users.map((u) => u.username).filter(Boolean);

  if (!usernames.length) return null;

  const label =
    usernames.length === 1
      ? `${usernames[0]} est en train d’écrire…`
      : `${usernames.join(", ")} sont en train d’écrire…`;

  return <div className="typing-indicator">{label}</div>;
}
