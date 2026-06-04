"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const components = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-bold text-foreground mb-3 mt-6 first:mt-0" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-semibold text-foreground mb-2 mt-5 flex items-center gap-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-medium text-foreground mb-2 mt-4" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-sm leading-relaxed text-muted-foreground mb-3 last:mb-0" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="space-y-1.5 mb-4" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="space-y-1.5 mb-4 list-decimal list-inside" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => {
    const text = typeof children === "string" ? children : "";
    const isStore = text.includes("Amazon") || text.includes("Flipkart") || text.includes("Reliance");
    return (
      <li className={`text-sm leading-relaxed ${isStore ? "text-foreground font-medium" : "text-muted-foreground"} flex items-start gap-2`} {...props}>
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
        <span>{children}</span>
      </li>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  a: ({ href, children, ...props }: any) => (
    <span className="text-primary underline underline-offset-2 decoration-primary/30" {...props}>{children}</span>
  ),
};

export function AISummary({ response }: { response: string }) {
  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-base">AI Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {response}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
