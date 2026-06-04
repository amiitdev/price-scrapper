"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchStore } from "@/stores/search";

export function useSearch() {
  const { setSearching, setResult, setError, addToHistory } = useSearchStore();

  return useMutation({
    mutationFn: async (query: string) => {
      setSearching(true);
      addToHistory(query);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => setError(err instanceof Error ? err.message : "Search failed"),
  });
}
