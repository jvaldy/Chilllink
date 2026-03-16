// src/features/auth/authService.js
// -------------------------------------------
// Service qui gère l’authentification avec l’API
// (inscription, connexion et gestion du token)
// -------------------------------------------

const API_BASE = 'http://localhost:8888/api'; // URL de base de l’API backend

/* -------------------------------------------------------------------------- */
/*                              REGISTER USER                                 */
/* -------------------------------------------------------------------------- */
/**
 * Envoie une requête pour créer un nouvel utilisateur
 * @param {Object} param0 
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function registerUser({ email, password }) {
  try {
    // Appel API pour créer un compte utilisateur
    const resp = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Envoi en JSON
      body: JSON.stringify({ email, password }), // Données envoyées au backend
    });

    const data = await resp.json(); // Lecture de la réponse JSON

    // Si la réponse contient une erreur
    if (!resp.ok) {
      return { success: false, error: data.error || 'Erreur lors de l’inscription.' };
    }

    // Inscription réussie
    return { success: true, data };
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    // Erreur réseau ou serveur inaccessible
    return { success: false, error: 'Impossible de contacter le serveur.' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                LOGIN USER                                  */
/* -------------------------------------------------------------------------- */
/**
 * Envoie une requête pour connecter l'utilisateur
 * et récupérer un token JWT
 * @param {Object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function loginUser({ email, password }) {
  try {
    // Appel API pour authentifier l'utilisateur
    const resp = await fetch(`${API_BASE}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Envoi JSON
      body: JSON.stringify({ email, password }), // Identifiants envoyés
    });

    const data = await resp.json(); // Lecture de la réponse

    // Vérifie si le token JWT est présent
    if (!resp.ok || !data.token) {
      return { success: false, error: data.error || 'Identifiants invalides.' };
    }

    // Connexion réussie → retour du token JWT
    return { success: true, token: data.token };
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    // Erreur de communication avec l’API
    return { success: false, error: 'Impossible de contacter le serveur.' };
  }
}

/* -------------------------------------------------------------------------- */
/*                            TOKEN MANAGEMENT                                */
/* -------------------------------------------------------------------------- */

// Sauvegarde le token JWT dans le localStorage du navigateur
export function saveToken(token) {
  localStorage.setItem('authToken', token);
}

// Récupère le token JWT stocké
export function getToken() {
  return localStorage.getItem('authToken');
}

// Supprime le token lors de la déconnexion
export function removeToken() {
  localStorage.removeItem('authToken');
}