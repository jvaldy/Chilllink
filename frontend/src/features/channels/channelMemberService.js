import { httpRequest } from "../../shared/api/httpClient";
import { endpoints } from "../../shared/api/endpoints";

export function fetchChannelMembers(workspaceId, channelId) {
  return httpRequest(
    "GET",
    endpoints.channels.members(workspaceId, channelId)
  );
}

export function addChannelMember(workspaceId, channelId, email) {
  return httpRequest(
    "POST",
    endpoints.channels.members(workspaceId, channelId),
    { body: { email } }
  );
}

export function removeChannelMember(workspaceId, channelId, userId) {
  return httpRequest(
    "DELETE",
    endpoints.channels.memberItem(workspaceId, channelId, userId)
  );
}
