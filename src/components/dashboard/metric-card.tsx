"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, description, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
