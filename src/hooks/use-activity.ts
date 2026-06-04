"use client";

import { useQuery } from "@tanstack/react-query";

export function useRecentActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await fetch("/api/activity");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60_000,
  });
}
