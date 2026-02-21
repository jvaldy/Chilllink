import { httpRequest } from "../../shared/api/httpClient";
import { endpoints } from "../../shared/api/endpoints";

export function getProfile() {
  return httpRequest("GET", endpoints.profile.item);
}

export function patchProfile(payload) {
  return httpRequest("PATCH", endpoints.profile.item, {
    body: payload,
  });
}