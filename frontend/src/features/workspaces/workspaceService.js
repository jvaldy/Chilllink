/**
 * workspaceService.js
 * -------------------
 * Couche service pour les workspaces.
 * Ne contient QUE des appels API.
 */

import { httpRequest } from "../../shared/api/httpClient";
import { endpoints } from "../../shared/api/endpoints";

/**
 * Récupère les workspaces de l’utilisateur connecté
 */
export function fetchWorkspaces() {
  return httpRequest("GET", endpoints.workspaces.list);
}

/**
 * Crée un workspace
 * POST /api/workspaces  { name }
 *
 * Note: souvent list et create partagent la même route "/api/workspaces"
 * donc on réutilise endpoints.workspaces.list.
 */
export function createWorkspace(name) {
  return httpRequest("POST", endpoints.workspaces.list, {
    body: { name },
  });
}
