"use client";

import { useState, useRef } from "react";
import { useSearch } from "@/hooks/use-search";
import { useSearchStore } from "@/stores/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles, X } from "lucide-react";

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSearch();
  const { isSearching, result } = useSearchStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSearching) {
      search.mutate(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Search products... e.g. "Find cheapest Samsung S25 Ultra"'
          autoFocus={autoFocus}
          className="h-14 pl-12 pr-24 text-base bg-muted/50 border-muted rounded-2xl"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {input && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setInput("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={!input.trim() || isSearching}
            className="h-10 gap-2 rounded-xl"
          >
            <Sparkles className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
