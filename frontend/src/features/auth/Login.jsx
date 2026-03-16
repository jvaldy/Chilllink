import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./authService";
import { authStore } from "./authStore";
import "./Login.css";

export default function Login() {
  // Navigation apres authentification
  const navigate = useNavigate();

  // Etat du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Etat UI
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset des messages et lancement du chargement
    setError("");
    setLoading(true);

    // Appel API login
    const result = await loginUser({ email, password });

    if (!result.success) {
      // Message d'erreur utilisateur
      setError(result.error || "Identifiants invalides.");
      setLoading(false);
      return;
    }

    // Sauvegarde du token et redirection
    authStore.setToken(result.token);
    setLoading(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <div className="auth-logo">
          <img src="/logo-chilllink.png" alt="Chilllink Logo" />
        </div>

        <h2>Connexion</h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Mot de passe */}
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Erreur */}
          {error && <p className="auth-error">{error}</p>}

          {/* Soumission */}
          <button disabled={loading} className="auth-btn" type="submit">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Pas de compte ?{" "}
          <span className="auth-link" onClick={() => navigate("/register")}>
            Inscription
          </span>
        </p>
      </div>
    </div>
  );
}
