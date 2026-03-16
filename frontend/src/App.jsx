import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import { authStore } from "./features/auth/authStore";
import { endpoints } from "./shared/api/endpoints";
import { httpRequest } from "./shared/api/httpClient";
import "./shared/styles/theme.css";

export default function App() {
  const [isLogged, setIsLogged] = useState(authStore.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setIsLogged(!!state.token);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!authStore.isAuthenticated()) return;

      try {
        await httpRequest("GET", endpoints.auth.me);
      } catch { /* empty */ }
    };

    checkTokenValidity();
    const intervalId = window.setInterval(checkTokenValidity, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
      }}
    >
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLogged ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={
            <ProtectedRoute publicOnly>
              <CenteredAuth>
                <Login />
              </CenteredAuth>
            </ProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={
            <ProtectedRoute publicOnly>
              <CenteredAuth>
                <Register />
              </CenteredAuth>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function CenteredAuth({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "400px" }}>{children}</div>
    </div>
  );
}
