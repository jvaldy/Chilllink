/**
 * useChannels.js
 * -------------
 * Hook métier pour charger les channels d’un workspace sélectionné.
 *
 * Responsabilités :
 * - charger channels quand workspaceId change
 * - gérer loading / error
 * - gérer selectedChannelId
 */

import { useEffect, useState } from "react";
import { fetchChannelsByWorkspace } from "./channelService";

export function useChannels(workspaceId) {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si aucun workspace sélectionné : reset total
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
    loading,
    error,
  };
}
