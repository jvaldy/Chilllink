import { useState } from "react";
import { loginUser } from "./authService";
import { authStore } from "./authStore";
import "./Login.css";

export default function Login({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginUser({ email, password });

    if (!result.success) {
      setError(result.error || "Identifiants invalides.");
      setLoading(false);
      return;
    }

    authStore.setToken(result.token);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Connexion</h2>

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

          <button disabled={loading} className="auth-btn">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Pas de compte ?{" "}
          <span className="auth-link" onClick={onSwitchToRegister}>
            Inscription
          </span>
        </p>
      </div>
    </div>
  );
}
