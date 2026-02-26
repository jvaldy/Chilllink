/**
 * channelService.js
 * -----------------
 * Couche service pour les channels.
 * Ne contient QUE des appels API.
 */

import { httpRequest } from "../../shared/api/httpClient";
import { endpoints } from "../../shared/api/endpoints";

/**
 * Liste les channels d'un workspace
 *
 * @param {number} workspaceId
 * @returns {Promise<Array<{id:number,name:string}>>}
 */
export function fetchChannelsByWorkspace(workspaceId) {
  return httpRequest("GET", endpoints.workspaces.channels(workspaceId));
}

export function createChannel(workspaceId, name) {
  return httpRequest(
    "POST",
    endpoints.workspaces.channels(workspaceId),
    {
      body: { name },
    }
  );
}


export function updateChannel(workspaceId, channelId, name) {
  return httpRequest(
    "PATCH",
    `${endpoints.workspaces.channels(workspaceId)}/${channelId}`,
    {
      body: { name },
    }
  );
}


export function deleteChannel(workspaceId, channelId) {
  return httpRequest(
    "DELETE",
    `${endpoints.workspaces.channels(workspaceId)}/${channelId}`
  );
}