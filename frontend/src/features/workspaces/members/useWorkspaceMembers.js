import { useCallback, useEffect, useState } from "react";
import {
  fetchWorkspaceMembers,
  addWorkspaceMemberByEmail,
  removeWorkspaceMember,
} from "./workspaceMemberService";

export function useWorkspaceMembers(workspaceId, { enabled = true } = {}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!workspaceId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWorkspaceMembers(workspaceId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Impossible de charger les membres");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const inviteByEmail = useCallback(
    async (email) => {
      if (!workspaceId) return { success: false, error: "workspaceId manquant" };

      setSubmitting(true);
      setError(null);

      try {
        const payload = await addWorkspaceMemberByEmail(workspaceId, email);

        const user = payload?.user ?? payload;

        if (user?.id) {
          setMembers((prev) => {
            if (prev.some((m) => m.id === user.id)) return prev;
            return [...prev, user];
          });
        } else {
          await refresh();
        }

        return { success: true };
      } catch (err) {
        const msg = err?.message || "Invitation impossible";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSubmitting(false);
      }
    },
    [workspaceId, refresh]
  );

  const removeMember = useCallback(
    async (userId) => {
      if (!workspaceId) return { success: false, error: "workspaceId manquant" };

      setSubmitting(true);
      setError(null);

      try {
        await removeWorkspaceMember(workspaceId, userId);
        setMembers((prev) => prev.filter((m) => m.id !== userId));
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Suppression impossible";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSubmitting(false);
      }
    },
    [workspaceId]
  );

  return {
    members,
    loading,
    submitting,
    error,
    refresh,
    inviteByEmail,
    removeMember,
  };
}
