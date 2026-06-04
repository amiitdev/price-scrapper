const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new APIError(res.status, json.error ?? "Request failed", json.details);
  }
  return json.data as T;
}

export const api = {
  search: (query: string) => request<any>(`/search?q=${encodeURIComponent(query)}`),
  getProduct: (id: string) => request<any>(`/product/${id}`),
  compare: (query: string) => request<any>(`/compare?query=${encodeURIComponent(query)}`),
  getHistory: (productId: string, days = 30) =>
    request<any>(`/history?productId=${productId}&days=${days}`),
  getRecommendations: (productId: string) =>
    request<any>(`/recommendations?productId=${productId}`),
  getAnalytics: (period = "30d") => request<any>(`/analytics?period=${period}`),
  getWatchlists: () => request<any[]>("/watchlist"),
  createWatchlist: (data: any) =>
    request<any>("/watchlist", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteWatchlist: (id: string) =>
    request<any>(`/watchlist?id=${id}`, { method: "DELETE" }),
  getAlerts: () => request<any[]>("/alerts"),
  createAlert: (data: any) =>
    request<any>("/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteAlert: (id: string) =>
    request<any>(`/alerts?id=${id}`, { method: "DELETE" }),
};
