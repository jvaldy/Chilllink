/**
 * App.jsx
 * -------
 * Point d’entrée principal du Front (React).
 *
 * Responsabilités :
 * - Charger les styles globaux (theme.css)
 * - Définir les routes de l’application (React Router)
 * - Gérer la redirection automatique selon l’état d’authentification
 * - Protéger les routes sensibles via ProtectedRoute
 *
 * Remarque importante :
 * - L’état "isLogged" est synchronisé avec authStore.
 * - Dès qu’un token change (login/logout), le routing s’adapte automatiquement.
 */

import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Pages d’authentification
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";

// Page principale après connexion
import Dashboard from "./pages/dashboard/Dashboard";

// Composant utilitaire pour protéger des routes (ex: /dashboard)
import ProtectedRoute from "./shared/components/ProtectedRoute";

// Store global d’authentification (token JWT, état connecté/déconnecté)
import { authStore } from "./features/auth/authStore";

// Design system global (variables CSS, couleurs, boutons, inputs, etc.)
import "./shared/styles/theme.css";

export default function App() {
  /**
   * État local représentant le statut de connexion.
   *
   * Initialisation :
   * - authStore.isAuthenticated() permet de déterminer si un token est présent (et potentiellement valide)
   *
   * But :
   * - permettre au router de rediriger automatiquement selon connecté / non connecté
   */
  const [isLogged, setIsLogged] = useState(authStore.isAuthenticated());

  /**
   * Synchronisation avec le store
   * ----------------------------
   * On s'abonne aux changements du store d’authentification :
   * - Si le token est défini => isLogged = true
   * - Si le token est supprimé => isLogged = false
   *
   * Le return "unsubscribe" garantit qu’on nettoie l’abonnement
   * lorsque le composant App est démonté (bonne pratique React).
   */
  useEffect(() => {
    const unsubscribe = authStore.subscribe((token) => {
      // !!token convertit en booléen :
      // - token vide => false
      // - token présent => true
      setIsLogged(!!token);
    });

    return unsubscribe;
  }, []);

  return (
    /**
     * Wrapper global :
     * - minHeight: 100vh permet d’avoir un fond full-height
     * - background récupère la variable CSS du thème (design system)
     */
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
      }}
    >
      <Routes>
        {/**
         * Route racine "/"
         * ----------------
         * Redirection automatique :
         * - si connecté => /dashboard
         * - sinon => /login
         */}
        <Route
          path="/"
          element={<Navigate to={isLogged ? "/dashboard" : "/login"} replace />}
        />

        {/**
         * Route "/login"
         * --------------
         * Si l’utilisateur est déjà connecté :
         * - on le renvoie vers /dashboard (évite de voir la page login)
         *
         * Sinon :
         * - on affiche le composant Login centré à l’écran (CenteredAuth)
         */}
        <Route
          path="/login"
          element={
            isLogged ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <CenteredAuth>
                <Login />
              </CenteredAuth>
            )
          }
        />

        {/**
         * Route "/register"
         * -----------------
         * Même logique que /login :
         * - si déjà connecté => dashboard
         * - sinon => affichage de Register centré
         */}
        <Route
          path="/register"
          element={
            isLogged ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <CenteredAuth>
                <Register />
              </CenteredAuth>
            )
          }
        />

        {/**
         * Route "/dashboard"
         * ------------------
         * Page protégée :
         * - le composant ProtectedRoute vérifie que l’utilisateur est authentifié
         * - sinon redirection vers /login
         */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/**
         * Route wildcard "*"
         * ------------------
         * Tout chemin inconnu est redirigé vers "/"
         * - ce qui déclenche ensuite la redirection vers login ou dashboard
         */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

/**
 * CenteredAuth
 * ------------
 * Petit composant utilitaire servant à centrer les pages d’authentification.
 *
 * Intérêt :
 * - évite de dupliquer le même code de centrage dans Login et Register
 * - permet de garder Login/Register "purs" (ils ne gèrent que leur formulaire)
 */
function CenteredAuth({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh", // prend toute la hauteur de l’écran
        display: "flex",
        justifyContent: "center", // centre horizontalement
        alignItems: "center", // centre verticalement
      }}
    >
      {/* Largeur fixe pour garder une UI stable */}
      <div style={{ width: "400px" }}>{children}</div>
    </div>
  );
}
