/**
 * authStore.js
 * ------------
 * Store d’authentification global de l’application.
 *
 * Rôle principal :
 * - Centraliser la gestion du token JWT
 * - Fournir un état d’authentification unique et partagé
 * - Notifier automatiquement les composants abonnés lors d’un login / logout
 *
 * Ce store implémente un pattern "Observer" simple
 * (sans dépendre d’une librairie externe comme Redux ou Zustand).
 */

import { getToken, saveToken, removeToken } from "./authService";

class AuthStore {
  constructor() {
    /**
     * Token JWT actuellement en mémoire.
     *
     * Initialisation :
     * - getToken() récupère le token stocké (localStorage / sessionStorage)
     * - permet de restaurer la session après un refresh de page
     */
    this.token = getToken();

    /**
     * Liste des listeners abonnés au store.
     *
     * Utilisation d’un Set :
     * - empêche les doublons
     * - facilite l’ajout et la suppression des abonnements
     */
    this.listeners = new Set();
  }

  /**
   * Indique si l’utilisateur est authentifié.
   *
   * Retourne :
   * - true si un token est présent
   * - false sinon
   *
   * Cette méthode est utilisée :
   * - par ProtectedRoute
   * - par App.jsx pour gérer les redirections
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Abonnement à l’état du store.
   *
   * @param {Function} listener - fonction appelée à chaque changement de token
   * @returns {Function} fonction de désabonnement
   *
   * Exemple d’utilisation :
   * const unsubscribe = authStore.subscribe((token) => { ... });
   */
  subscribe(listener) {
    this.listeners.add(listener);

    // Retourne une fonction de cleanup (bonne pratique React)
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifie tous les abonnés du store.
   *
   * Appelée automatiquement :
   * - après un login (setToken)
   * - après un logout (clear)
   *
   * Chaque listener reçoit la valeur actuelle du token.
   */
  notify() {
    this.listeners.forEach((listener) => listener(this.token));
  }

  /**
   * Définit le token JWT après une authentification réussie.
   *
   * Étapes :
   * - mise à jour du token en mémoire
   * - persistance via saveToken()
   * - notification des composants abonnés
   *
   * @param {string} token - JWT retourné par l’API
   */
  setToken(token) {
    this.token = token;
    saveToken(token);
    this.notify();
  }

  /**
   * Déconnexion de l’utilisateur.
   *
   * Étapes :
   * - suppression du token en mémoire
   * - suppression du token du stockage persistant
   * - notification des abonnés
   *
   * Cette méthode est appelée depuis :
   * - Dashboard (bouton "Se déconnecter")
   */
  clear() {
    this.token = null;
    removeToken();
    this.notify();
  }
}

/**
 * Instance unique du store (singleton).
 *
 * Tous les composants importent la même instance,
 * garantissant une source de vérité unique pour l’authentification.
 */
export const authStore = new AuthStore();
