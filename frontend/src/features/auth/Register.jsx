/**
 * Composant Register
 * ------------------
 * Gère l’inscription d’un nouvel utilisateur via email / mot de passe.
 *
 * Responsabilités :
 * - Afficher le formulaire d’inscription
 * - Gérer les états du formulaire (email, mot de passe, succès, erreur, chargement)
 * - Appeler le service d’inscription côté API
 * - Informer l’utilisateur du résultat de l’inscription
 * - Proposer une redirection vers la page de connexion
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Service responsable de l’appel API d’inscription
import { registerUser } from "./authService";

// Styles spécifiques à la page d’inscription
import "./Register.css";

export default function Register() {
  /**
   * Hook de navigation React Router
   * Utilisé pour rediriger l’utilisateur vers la page de connexion
   */
  const navigate = useNavigate();

  /**
   * États locaux du formulaire
   */
  const [email, setEmail] = useState("");        // Email saisi par l’utilisateur
  const [password, setPassword] = useState("");  // Mot de passe saisi
  const [success, setSuccess] = useState("");    // Message de succès
  const [error, setError] = useState("");        // Message d’erreur
  const [loading, setLoading] = useState(false); // Indique si la requête est en cours

  /**
   * Soumission du formulaire d’inscription
   * @param {Event} e - événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Réinitialisation des messages précédents
    setError("");
    setSuccess("");
    setLoading(true); // Active l’état de chargement

    /**
     * Appel au service d’inscription
     * Envoie les données utilisateur à l’API
     */
    const result = await registerUser({ email, password });

    /**
     * En cas d’échec :
     * - affichage du message d’erreur
     * - arrêt du chargement
     */
    if (!result.success) {
      setError(result.error || "Erreur lors de l’inscription.");
      setLoading(false);
      return;
    }

    /**
     * En cas de succès :
     * - affichage d’un message de confirmation
     * - réinitialisation du formulaire
     * - arrêt du chargement
     */
    setSuccess("Compte créé avec succès ! Vous pouvez vous connecter.");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Inscription</h2>

        {/* Formulaire d’inscription */}
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

          {/* Messages conditionnels */}
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          {/* Bouton désactivé pendant l’appel API */}
          <button disabled={loading} className="auth-btn" type="submit">
            {loading ? "En cours..." : "S'inscrire"}
          </button>
        </form>

        {/* Lien vers la page de connexion */}
        <p className="auth-switch">
          Déjà un compte ?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Connexion
          </span>
        </p>
      </div>
    </div>
  );
}
