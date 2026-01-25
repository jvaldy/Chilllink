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
    addChannel,        // 🔥 exposé correctement
    loading,
    error,
  };
}
