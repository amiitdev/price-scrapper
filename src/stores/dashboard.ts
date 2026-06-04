import { create } from "zustand";
import type { DashboardStats } from "../../types";

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  period: string;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setPeriod: (period: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: true,
  period: "30d",
  setStats: (stats) => set({ stats, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setPeriod: (period) => set({ period }),
}));
