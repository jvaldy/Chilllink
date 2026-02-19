/**
 * endpoints.js
 * ------------
 * Centralise toutes les routes API backend.
 * Évite les URLs en dur partout dans le front.
 */

export const API_BASE = "http://localhost:8888/api";

export const endpoints = {
  auth: {
    me: "/me",
  },

  workspaces: {
    list: '/workspaces',
    create: '/workspaces',
    item: (id) => `/workspaces/${id}`,

    channels: (workspaceId) => `/workspaces/${workspaceId}/channels`,

    members: (workspaceId) => `/workspaces/${workspaceId}/members`,
    memberItem: (workspaceId, userId) => `/workspaces/${workspaceId}/members/${userId}`,
  },

  channels: {
    messages: (channelId) => `/channels/${channelId}/messages`,
    typing: (channelId) => `/channels/${channelId}/typing`,

    members: (workspaceId, channelId) =>
      `/workspaces/${workspaceId}/channels/${channelId}/members`,

    memberItem: (workspaceId, channelId, userId) =>
      `/workspaces/${workspaceId}/channels/${channelId}/members/${userId}`,
  },


};
