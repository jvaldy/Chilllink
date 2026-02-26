/**
 * useWorkspaces.js
 * ----------------
 * Hook métier pour gérer les workspaces :
 * - chargement
 * - erreur
 * - sélection
 * - création
 */

import { useEffect, useState, useCallback } from "react";
import {
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "./workspaceService";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Création d’un workspace + mise à jour state
  const addWorkspace = useCallback(async (name) => {
    const workspace = await createWorkspace(name);

    setWorkspaces((prev) => [...prev, workspace]);
    setSelectedWorkspaceId(workspace.id);

    return workspace;
  }, []);

  const removeWorkspace = useCallback(async (workspaceId) => {
    await deleteWorkspace(workspaceId);

    setWorkspaces((prev) => {
      const updated = prev.filter((w) => w.id !== workspaceId);

      if (updated.length > 0) {
        setSelectedWorkspaceId(updated[0].id);
      } else {
        setSelectedWorkspaceId(null);
      }

      return updated;
    });
  }, []);

  const renameWorkspace = useCallback(async (workspaceId, name) => {
    const updated = await updateWorkspace(workspaceId, name);

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId ? updated : w
      )
    );

    return updated;
  }, []);

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
    addWorkspace, 
    removeWorkspace,
    renameWorkspace,
  };
}
