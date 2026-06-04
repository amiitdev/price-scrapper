"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useWatchlists() {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: async () => {
      const res = await fetch("/api/watchlist");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; productIds?: string[] }) => {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlists"] }),
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlists"] }),
  });
}
