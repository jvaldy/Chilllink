import { getToken, saveToken, removeToken } from "./authService";

class AuthStore {
  constructor() {
    this.token = getToken();
    this.user = null;           
    this.listeners = new Set();
  }

  isAuthenticated() {
    return !!this.token;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener({ token: this.token, user: this.user }));
  }


  setUser(user) {
    this.user = user ?? null;
    this.notify();
  }


  setAuth(token, user = null) {
    this.token = token;
    saveToken(token);
    this.user = user ?? this.user;
    this.notify();
  }

  setToken(token) {
    this.token = token;
    saveToken(token);
    this.notify();
  }

  clear() {
    this.token = null;
    this.user = null;          
    removeToken();
    this.notify();
  }
}

export const authStore = new AuthStore();
