import { create } from "zustand";
import type { IWatchlist } from "@/lib/db/models/Watchlist";

interface WatchlistState {
  watchlists: IWatchlist[];
  selectedId: string | null;
  isLoading: boolean;
  setWatchlists: (watchlists: IWatchlist[]) => void;
  addWatchlist: (watchlist: IWatchlist) => void;
  removeWatchlist: (id: string) => void;
  selectWatchlist: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  watchlists: [],
  selectedId: null,
  isLoading: false,
  setWatchlists: (watchlists) => set({ watchlists }),
  addWatchlist: (watchlist) =>
    set((state) => ({ watchlists: [watchlist, ...state.watchlists] })),
  removeWatchlist: (id) =>
    set((state) => ({
      watchlists: state.watchlists.filter((w) => w._id.toString() !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  selectWatchlist: (id) => set({ selectedId: id }),
  setLoading: (isLoading) => set({ isLoading }),
}));
