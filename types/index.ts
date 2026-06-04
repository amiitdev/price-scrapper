export type StoreName =
  | "amazon"
  | "flipkart"
  | "reliance_digital";

export type Currency = "INR" | "USD";

export type AlertType = "price_drop" | "price_increase" | "target_price" | "in_stock" | "flash_sale";

export type AgentStatus = "success" | "failure" | "running";

export type AgentName =
  | "product_detection"
  | "store_search"
  | "price_aggregation"
  | "historical_analysis"
  | "recommendation";

export type RecommendationAction = "BUY_NOW" | "WAIT" | "GOOD_DEAL" | "OVERPRICED";

export interface SearchResult {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: Currency;
  store: StoreName;
  storeLogo?: string;
  discount: number;
  rating: number;
  reviewCount: number;
  seller: string;
  deliveryDate?: string;
  url: string;
  imageUrl?: string;
  inStock: boolean;
  isLowest: boolean;
}

export interface AggregatedProduct {
  id: string;
  name: string;
  brand: string;
  category?: string;
  imageUrl?: string;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currency: Currency;
  storeCount: number;
  results: SearchResult[];
}

export interface PricePoint {
  date: string;
  price: number;
  store: StoreName;
}

export interface PriceStats {
  lowest: number;
  highest: number;
  average: number;
  current: number;
  volatility: number;
  sevenDayTrend: number;
  thirtyDayTrend: number;
  ninetyDayTrend: number;
}

export interface AgentLogEntry {
  agentName: AgentName;
  input: unknown;
  output: unknown;
  duration: number;
  status: AgentStatus;
  error?: string;
  executedAt: string;
}

export interface AIRecommendation {
  action: RecommendationAction;
  confidence: number;
  reason: string;
  insights: string[];
  historicalContext?: string;
  bestPrice?: number;
  potentialSavings?: number;
}

export interface DashboardStats {
  totalProducts: number;
  priceDropsToday: number;
  trackedProducts: number;
  bestDeals: number;
  totalSearches: number;
  activeAlerts: number;
  productsByStore: Record<StoreName, number>;
  recentSearches: number;
}

export interface UserPreferences {
  currency: Currency;
  theme: "dark" | "light";
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertThreshold: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
