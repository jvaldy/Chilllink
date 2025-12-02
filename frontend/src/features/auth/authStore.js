// Gérer l’état d’authentification

import { getToken, saveToken, removeToken } from "./authService";

class AuthStore {
  constructor() {
    this.token = getToken(); // récupère le token en localStorage s’il existe
  }

  isAuthenticated() {
    return !!this.token;
  }

  setToken(token) {
    this.token = token;
    saveToken(token);
  }

  clear() {
    this.token = null;
    removeToken();
  }
}

export const authStore = new AuthStore();
