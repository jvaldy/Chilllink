import { httpRequest } from "../../shared/api/httpClient";

/**
 * Envoie un événement "typing" pour un channel
 */
export async function sendTyping(channelId, user) {
  return httpRequest("POST", `/channels/${channelId}/typing`, {
    body: {
      userId: user.id,
      username: user.username,
    },
  });
}
