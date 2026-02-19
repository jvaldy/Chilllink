import { useEffect, useState, useCallback } from "react";
import {
  fetchChannelMembers,
  addChannelMember,
  removeChannelMember,
} from "./channelMemberService";

export function useChannelMembers(workspaceId, channelId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!workspaceId || !channelId) return;

    setLoading(true);
    try {
      const data = await fetchChannelMembers(workspaceId, channelId);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, channelId]);

  const add = async (email) => {
    await addChannelMember(workspaceId, channelId, email);
    await load();
  };

  const remove = async (userId) => {
    await removeChannelMember(workspaceId, channelId, userId);
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  useEffect(() => {
    load();
  }, [load]);

  return {
    members,
    loading,
    add,
    remove,
    reload: load,
  };
}
