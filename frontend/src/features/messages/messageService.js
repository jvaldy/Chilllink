/**
 * messageService.js
 * -----------------
 * Couche service pour les messages.
 * - Charger les messages d’un channel
 * - Envoyer un message
 */

import { httpRequest } from "../../shared/api/httpClient";
import { endpoints } from "../../shared/api/endpoints";

/**
 * Charger les messages d’un channel
 * @param {number} channelId
 * @param {object} pagination { page, limit }
 */
export function fetchMessages(channelId, { page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit }).toString();
  return httpRequest("GET", `${endpoints.channels.messages(channelId)}?${params}`);
}

/**
 * Envoyer un message dans un channel
 * @param {number} channelId
 * @param {string} content
 */
export function postMessage(channelId, content) {
  return httpRequest("POST", endpoints.channels.messages(channelId), {
    body: { content },
  });
}
