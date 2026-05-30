"use client";

import { MapPin, X } from "lucide-react";
import type { SavedCity } from "@/lib/supabase/types";
import type { GeoResult } from "@/lib/open-meteo";
import { savedCityToGeo } from "@/hooks/useSavedCities";

export function FavoritesBar({
  cities,
  selected,
  onSelect,
  onRemove,
}: {
  cities: SavedCity[];
  selected: GeoResult | null;
  onSelect: (city: GeoResult) => void;
  onRemove: (id: string) => void;
}) {
  if (cities.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
        Pinned
      </span>
      {cities.map((city) => {
        const geo = savedCityToGeo(city);
        const active =
          selected?.latitude === city.latitude &&
          selected?.longitude === city.longitude;

        return (
          <div
            key={city.id}
            className={`group flex items-center gap-1 rounded-md border font-mono text-xs transition-colors ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-bg-card text-text-muted hover:border-accent/50 hover:text-text"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(geo)}
              className="flex items-center gap-1.5 px-2.5 py-1.5"
            >
              <MapPin className="w-3 h-3" />
              {city.name}
              {city.country && (
                <span className="text-text-dim">{city.country}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onRemove(city.id)}
              className="pr-2 opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-opacity"
              aria-label={`Remove ${city.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
