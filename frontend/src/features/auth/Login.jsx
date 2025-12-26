/**
 * Composant Login
 * ----------------
 * Gère l’authentification d’un utilisateur via email / mot de passe.
 * 
 * Responsabilités :
 * - Afficher le formulaire de connexion
 * - Gérer les états du formulaire (email, mot de passe, erreurs, chargement)
 * - Appeler le service d’authentification
 * - Stocker le token JWT en cas de succès
 * - Rediriger l’utilisateur vers le dashboard
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Service responsable de l’appel API de connexion
import { loginUser } from "./authService";

// Store global d’authentification (gestion du token JWT)
import { authStore } from "./authStore";

// Styles spécifiques à la page de login
import "./Login.css";

export default function Login() {
  /**
   * Hook de navigation React Router
   * Permet de rediriger l’utilisateur après une action (connexion réussie, inscription, etc.)
   */
  const navigate = useNavigate();

  /**
   * États locaux du formulaire
   */
  const [email, setEmail] = useState("");        // Email saisi par l’utilisateur
  const [password, setPassword] = useState("");  // Mot de passe saisi
  const [error, setError] = useState("");         // Message d’erreur à afficher
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours

  /**
   * Soumission du formulaire de connexion
   * @param {Event} e - événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setError("");       // Réinitialise les erreurs précédentes
    setLoading(true);   // Active l’état de chargement (désactivation du bouton)

    /**
     * Appel au service d’authentification
     * Envoie l’email et le mot de passe à l’API
     */
    const result = await loginUser({ email, password });

    /**
     * En cas d’échec :
     * - affichage du message d’erreur
     * - arrêt du chargement
     */
    if (!result.success) {
      setError(result.error || "Identifiants invalides.");
      setLoading(false);
      return;
    }

    /**
     * En cas de succès :
     * - stockage du token JWT dans le store global
     * - arrêt du chargement
     */
    authStore.setToken(result.token);
    setLoading(false);

    /**
     * Redirection vers le dashboard
     * replace: true empêche le retour à la page login via le bouton "retour"
     */
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Connexion</h2>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Mise à jour de l’état email
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Mise à jour de l’état password
            required
          />

          {/* Affichage conditionnel du message d’erreur */}
          {error && <p className="auth-error">{error}</p>}

          {/* Bouton de soumission désactivé pendant le chargement */}
          <button disabled={loading} className="auth-btn" type="submit">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Lien vers la page d’inscription */}
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
