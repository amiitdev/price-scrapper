"use client";

import { useQuery } from "@tanstack/react-query";

export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await fetch(`/api/product/${productId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!productId,
    staleTime: 30_000,
  });
}

export function usePriceHistory(productId: string | null, days = 30) {
  return useQuery({
    queryKey: ["priceHistory", productId, days],
    queryFn: async () => {
      const res = await fetch(`/api/history?productId=${productId}&days=${days}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!productId,
    staleTime: 60_000,
  });
}

export function useRecommendation(productId: string | null) {
  return useQuery({
    queryKey: ["recommendation", productId],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?productId=${productId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!productId,
    staleTime: 120_000,
  });
}
