import { useState } from "react";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./pages/Dashboard";
import { authStore } from "./features/auth/authStore";
import "./shared/styles/theme.css";

export default function App() {
  const [isLogged, setIsLogged] = useState(authStore.isAuthenticated());
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  const handleLoginSuccess = () => {
    setIsLogged(true);
  };

  if (isLogged) {
    return <Dashboard />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "400px" }}>
        {mode === "login" ? (
          <Login 
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <Register 
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}
