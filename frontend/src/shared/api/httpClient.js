/**
 * httpClient.js
 * -------------
 * Client HTTP centralisé.
 * - JWT auto
 * - erreurs standardisées (status/payload)
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
  const token = authStore.token;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const fullUrl = `${API_BASE}${url}`;
  const response = await fetch(fullUrl, config);

  // Try parse json (even on error)
  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // fallback text (useful for Symfony debug/html)
    try {
      const text = await response.text();
      data = text ? { raw: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      authStore.clear();
    }

    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `HTTP ${response.status}`;

    throw new ApiError(message, {
      status: response.status,
      payload: data,
      url: fullUrl,
      method,
    });
  }

  return data;
}
