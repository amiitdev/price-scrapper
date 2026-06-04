"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalytics(period = "30d") {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 120_000,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [analytics, alerts] = await Promise.all([
        fetch("/api/analytics?period=30d").then((r) => r.json()),
        fetch("/api/alerts").then((r) => r.json()),
      ]);
      return {
        stats: analytics.data,
        alerts: alerts.data,
      };
    },
    staleTime: 120_000,
  });
}
