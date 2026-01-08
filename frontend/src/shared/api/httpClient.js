/**
 * httpClient.js
 * -------------
 * Client HTTP centralisé pour toute l’application.
 *
 * Responsabilités :
 * - Injecter automatiquement le token JWT
 * - Centraliser fetch + gestion d’erreurs
 * - Éviter la duplication de logique réseau
 */

import { authStore } from '../../features/auth/authStore';
import { API_BASE } from './endpoints';

export async function httpRequest(
  method,
  url,
  { body = null, headers = {} } = {}
) {
  const token = authStore.token;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Injection automatique du token JWT si présent
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${url}`, config);

  // Tentative de lecture JSON (même en erreur)
  let data = null;
  try {
    data = await response.json();
  } catch {
    // réponse vide (204 par exemple)
  }

  // Gestion globale des erreurs HTTP
  if (!response.ok) {
    // Token invalide ou expiré → logout global
    if (response.status === 401) {
      authStore.clear();
    }

    const error = data?.error || 'Erreur API';
    throw new Error(error);
  }

  return data;
}
