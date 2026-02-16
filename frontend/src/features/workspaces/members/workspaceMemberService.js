import { httpRequest } from "../../../shared/api/httpClient";
import { endpoints } from "../../../shared/api/endpoints";

export function fetchWorkspaceMembers(workspaceId) {
  return httpRequest("GET", endpoints.workspaces.members(workspaceId));
}

export function addWorkspaceMemberByEmail(workspaceId, email) {
  return httpRequest("POST", endpoints.workspaces.members(workspaceId), {
    body: { email },
  });
}

export function removeWorkspaceMember(workspaceId, userId) {
  return httpRequest("DELETE", endpoints.workspaces.memberItem(workspaceId, userId));
}

export function fetchWorkspaceInfo(workspaceId) {
  return httpRequest("GET", endpoints.workspaces.item(workspaceId));
}
