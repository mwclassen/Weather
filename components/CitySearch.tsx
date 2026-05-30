"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useCitySearch } from "@/hooks/useCitySearch";
import { formatCityLabel, type GeoResult } from "@/lib/open-meteo";

export function CitySearch({
  onSelect,
}: {
  onSelect: (city: GeoResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useCitySearch(debounced);

  useEffect(() => {
    setHighlight(0);
  }, [results]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = useCallback(
    (city: GeoResult) => {
      onSelect(city);
      setQuery("");
      setDebounced("");
      setOpen(false);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 focus-within:border-accent focus-within:shadow-[0_0_12px_var(--border-glow)] transition-shadow">
        {isFetching ? (
          <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-text-muted shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          className="flex-1 bg-transparent font-mono text-sm text-text placeholder:text-text-dim outline-none"
          autoComplete="off"
        />
        <span className="font-mono text-[10px] text-text-dim hidden sm:inline">
          GEO:{"//"}open-meteo
        </span>
      </div>

      {open && debounced.length >= 2 && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-bg-elevated shadow-xl overflow-hidden">
          {results.length === 0 && !isFetching && (
            <li className="px-4 py-3 font-mono text-xs text-text-muted">
              No cities found
            </li>
          )}
          {results.map((city, i) => (
            <li key={`${city.id}-${city.latitude}`}>
              <button
                type="button"
                onClick={() => select(city)}
                className={`w-full text-left px-4 py-2.5 font-mono text-sm transition-colors ${
                  i === highlight
                    ? "bg-accent/10 text-accent"
                    : "text-text hover:bg-bg-card"
                }`}
              >
                {formatCityLabel(city)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
