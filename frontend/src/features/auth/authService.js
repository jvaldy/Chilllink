// src/features/auth/authService.js
// -------------------------------------------
// Service d'authentification (login / register / token)
// Toute la logique API centralisée ici
// -------------------------------------------

const API_BASE = 'http://localhost:8888/api';

/* -------------------------------------------------------------------------- */
/*                              REGISTER USER                                 */
/* -------------------------------------------------------------------------- */
/**
 * Inscrit un utilisateur via l’API
 * @param {Object} param0 
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function registerUser({ email, password }) {
  try {
    const resp = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { success: false, error: data.error || 'Erreur lors de l’inscription.' };
    }

    return { success: true, data };
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return { success: false, error: 'Impossible de contacter le serveur.' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                LOGIN USER                                  */
/* -------------------------------------------------------------------------- */
/**
 * Connecte un utilisateur via JWT
 * @param {Object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function loginUser({ email, password }) {
  try {
    const resp = await fetch(`${API_BASE}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.token) {
      return { success: false, error: data.error || 'Identifiants invalides.' };
    }

    return { success: true, token: data.token };
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return { success: false, error: 'Impossible de contacter le serveur.' };
  }
}

/* -------------------------------------------------------------------------- */
/*                            TOKEN MANAGEMENT                                */
/* -------------------------------------------------------------------------- */
export function saveToken(token) {
  localStorage.setItem('authToken', token);
}

export function getToken() {
  return localStorage.getItem('authToken');
}

export function removeToken() {
  localStorage.removeItem('authToken');
}
