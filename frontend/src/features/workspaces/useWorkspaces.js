/**
 * useWorkspaces.js
 * ----------------
 * Hook métier pour gérer les workspaces :
 * - chargement
 * - erreur
 * - sélection
 */

import { useEffect, useState } from 'react';
import { fetchWorkspaces } from './workspaceService';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetchWorkspaces()
      .then((data) => {
        if (!mounted) return;

        setWorkspaces(data);
        setSelectedWorkspaceId(data[0]?.id ?? null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    loading,
    error,
  };
}
