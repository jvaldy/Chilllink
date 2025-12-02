import { useState } from "react";
import { registerUser } from "./authService";
import "./Register.css";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await registerUser({ email, password });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess("Compte créé avec succès !");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Inscription</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button disabled={loading} className="auth-btn">
            {loading ? "En cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ?{" "}
          <span className="auth-link" onClick={onSwitchToLogin}>
            Connexion
          </span>
        </p>
      </div>
    </div>
  );
}
