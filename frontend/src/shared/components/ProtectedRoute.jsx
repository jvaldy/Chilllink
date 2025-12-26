/**
 * Composant ProtectedRoute
 * -----------------------
 * Protège les routes nécessitant une authentification.
 *
 * Responsabilités :
 * - Vérifier si l’utilisateur est authentifié
 * - Bloquer l’accès aux pages protégées si aucun token valide n’est présent
 * - Rediriger automatiquement vers la page de connexion
 *
 * Ce composant s’utilise comme un "wrapper" autour des routes sensibles
 * (dashboard, messagerie, paramètres, etc.).
 */

import { Navigate } from "react-router-dom";

// Store global d’authentification (gestion du token JWT)
import { authStore } from "../../features/auth/authStore";

export default function ProtectedRoute({ children }) {
  /**
   * Vérifie si l’utilisateur est authentifié
   *
   * La méthode isAuthenticated() doit :
   * - vérifier la présence d’un token JWT
   * - éventuellement valider sa structure ou sa date d’expiration
   */
  if (!authStore.isAuthenticated()) {
    /**
     * Si l’utilisateur n’est pas authentifié :
     * - redirection vers /login
     * - replace=true empêche l’accès à la page protégée via le bouton "retour"
     */
    return <Navigate to="/login" replace />;
  }

  /**
   * Si l’utilisateur est authentifié :
   * - rendu normal du composant enfant
   */
  return children;
}
