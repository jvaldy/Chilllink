/**
 * useChannels.js
 * -------------
 * Hook métier pour gérer les channels d’un workspace.
 *
 * Responsabilités :
 * - chargement
 * - erreur
 * - sélection
 * - création
 */

import { useEffect, useState, useCallback } from "react";
import {
  fetchChannelsByWorkspace,
  createChannel,
  updateChannel,
  deleteChannel,
} from "./channelService";

export function useChannels(workspaceId) {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =======================
     CREATE CHANNEL
  ======================= */
  const addChannel = useCallback(
    async (name) => {
      if (!workspaceId || !name?.trim()) return;

      try {
        const channel = await createChannel(workspaceId, name.trim());
        setChannels((prev) => [...prev, channel]);
        setSelectedChannelId(channel.id);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [workspaceId]
  );


  const renameChannel = useCallback(
    async (channelId, name) => {
      if (!workspaceId || !name?.trim()) return;

      const updated = await updateChannel(
        workspaceId,
        channelId,
        name.trim()
      );

      setChannels((prev) =>
        prev.map((c) =>
          c.id === channelId ? updated : c
        )
      );

      return updated;
    },
    [workspaceId]
  );



  const removeChannel = useCallback(
    async (channelId) => {
      if (!workspaceId) return;

      await deleteChannel(workspaceId, channelId);

      setChannels((prev) =>
        prev.filter((c) => c.id !== channelId)
      );

      setSelectedChannelId((prevSelected) =>
        prevSelected === channelId
          ? null
          : prevSelected
      );
    },
    [workspaceId]
  );



  /* =======================
     FETCH CHANNELS
  ======================= */
  useEffect(() => {
    if (!workspaceId) {
      setChannels([]);
      setSelectedChannelId(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    fetchChannelsByWorkspace(workspaceId)
      .then((data) => {
        if (!mounted) return;

        setChannels(data);
        setSelectedChannelId(data[0]?.id ?? null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
        setChannels([]);
        setSelectedChannelId(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  return {
    channels,
    selectedChannelId,
    setSelectedChannelId,
    addChannel,        
    loading,
    error,
    renameChannel,
    removeChannel,
  };
}
