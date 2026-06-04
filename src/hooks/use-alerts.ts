"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      type: string;
      targetPrice?: number;
      percentageChange?: number;
    }) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}
