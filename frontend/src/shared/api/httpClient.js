/**
 * Client HTTP centralise.
 * - Ajoute le JWT si present
 * - Normalise les erreurs
 */

import { authStore } from "../../features/auth/authStore";
import { API_BASE } from "./endpoints";

export class ApiError extends Error {
  constructor(message, { status, payload, url, method } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.url = url;
    this.method = method;
  }
}

export async function httpRequest(method, url, { body = null, headers = {} } = {}) {
  // Token JWT courant (si connecte)
  const token = authStore.token;

  // Configuration de base de la requete
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Ajout de l'entete Authorization si token present
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Serialization du body JSON si besoin
  if (body) {
    config.body = JSON.stringify(body);
  }

  // URL finale de l'API
  const fullUrl = `${API_BASE}${url}`;
  const response = await fetch(fullUrl, config);

  // Tente de parser du JSON meme en cas d'erreur
  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // Fallback texte (utile pour erreurs Symfony/HTML)
    try {
      const text = await response.text();
      data = text ? { raw: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // 401 => on invalide la session locale
    if (response.status === 401) {
      authStore.clear();
    }

    // Message d'erreur prioritaire
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `HTTP ${response.status}`;

    // Erreur normalisee pour le front
    throw new ApiError(message, {
      status: response.status,
      payload: data,
      url: fullUrl,
      method,
    });
  }

  return data;
}
