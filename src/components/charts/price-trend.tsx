"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PricePoint {
  date: string;
  price: number;
}

export function PriceTrendChart({
  data,
  title = "Price History",
  days = 30,
}: {
  data: PricePoint[];
  title?: string;
  days?: number;
}) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No price data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data
    .slice()
    .reverse()
    .map((d) => ({ date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }), price: d.price }));

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title} ({days}d)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
