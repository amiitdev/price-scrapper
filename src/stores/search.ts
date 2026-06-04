import { create } from "zustand";
import type { OrchestratorResult } from "@/lib/agents/orchestrator";

interface SearchState {
  query: string;
  isSearching: boolean;
  result: OrchestratorResult | null;
  error: string | null;
  history: Array<{ query: string; timestamp: number }>;
  setQuery: (query: string) => void;
  setSearching: (isSearching: boolean) => void;
  setResult: (result: OrchestratorResult | null) => void;
  setError: (error: string | null) => void;
  addToHistory: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  isSearching: false,
  result: null,
  error: null,
  history: [],
  setQuery: (query) => set({ query }),
  setSearching: (isSearching) => set({ isSearching }),
  setResult: (result) => set({ result, isSearching: false, error: null }),
  setError: (error) => set({ error, isSearching: false }),
  addToHistory: (query) =>
    set((state) => ({
      history: [
        { query, timestamp: Date.now() },
        ...state.history.filter((h) => h.query !== query).slice(0, 9),
      ],
    })),
  clearSearch: () => set({ query: "", result: null, error: null }),
}));
