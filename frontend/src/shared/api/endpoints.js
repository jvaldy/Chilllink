/**
 * Centralise les routes API backend pour eviter les URLs en dur.
 */

// Base commune de l'API
export const API_BASE = "http://localhost:8888/api";

// Helpers de routes par domaine
export const endpoints = {
  auth: {
    // Utilisateur connecte
    me: "/me",
  },

  workspaces: {
    // Liste / creation
    list: "/workspaces",
    create: "/workspaces",
    // Details
    item: (id) => `/workspaces/${id}`,

    // Channels d'un workspace
    channels: (workspaceId) => `/workspaces/${workspaceId}/channels`,

    // Membres d'un workspace
    members: (workspaceId) => `/workspaces/${workspaceId}/members`,
    memberItem: (workspaceId, userId) => `/workspaces/${workspaceId}/members/${userId}`,
  },

  channels: {
    // Messages d'un channel
    messages: (channelId) => `/channels/${channelId}/messages`,
    // Typing event
    typing: (channelId) => `/channels/${channelId}/typing`,

    // Membres d'un channel
    members: (workspaceId, channelId) =>
      `/workspaces/${workspaceId}/channels/${channelId}/members`,

    memberItem: (workspaceId, channelId, userId) =>
      `/workspaces/${workspaceId}/channels/${channelId}/members/${userId}`,
  },

  profile: {
    // Profil utilisateur
    item: "/profile",
  },
};
