"use client";

import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import type { AgentStep } from "@/lib/agents/orchestrator";

const agentLabels: Record<string, string> = {
  "Product Detection": "Detecting Product",
  "Store Search": "Searching Stores",
  "Price Aggregation": "Aggregating Prices",
  "Historical Analysis": "Analyzing History",
  Recommendation: "Generating Recommendation",
};

export function AgentSteps({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.agent}
          className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3"
        >
          {step.status === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : step.status === "failure" ? (
            <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          ) : (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {agentLabels[step.agent] ?? step.agent}
            </p>
            {step.duration > 0 && (
              <p className="text-xs text-muted-foreground">
                {(step.duration / 1000).toFixed(1)}s
              </p>
            )}
          </div>
          {step.status === "success" && (
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}
