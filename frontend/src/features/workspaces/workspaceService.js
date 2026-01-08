/**
 * workspaceService.js
 * -------------------
 * Couche service pour les workspaces.
 * Ne contient QUE des appels API.
 */

import { httpRequest } from '../../shared/api/httpClient';
import { endpoints } from '../../shared/api/endpoints';

/**
 * Récupère les workspaces de l’utilisateur connecté
 */
export function fetchWorkspaces() {
  return httpRequest('GET', endpoints.workspaces.list);
}
