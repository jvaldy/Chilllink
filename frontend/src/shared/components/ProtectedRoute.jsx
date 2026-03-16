import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../features/auth/authStore";

export default function ProtectedRoute({
  children,
  publicOnly = false,
  redirectTo = "/login",
  redirectWhenAuthed = "/dashboard",
}) {
  // Conserve la route d'origine pour un retour eventuel
  const location = useLocation();
  // Etat d'authentification courant
  const isAuthed = authStore.isAuthenticated();

  // Mode "publicOnly": bloque login/register si deja connecte
  if (publicOnly) {
    if (isAuthed) {
      return <Navigate to={redirectWhenAuthed} replace />;
    }

    return children;
  }

  // Mode "protege": redirige vers login si non authentifie
  if (!isAuthed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Acces autorise
  return children;
}
