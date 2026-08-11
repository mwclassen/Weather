"use client";

import { AlertCircle } from "lucide-react";
import { AppNav } from "./AppNav";
import { CitySearch } from "./CitySearch";
import { FavoritesBar } from "./FavoritesBar";
import { ForecastHeroSkeleton } from "./ForecastHero";
import { ForecastGridSkeleton } from "./ForecastGrid";
import { ThemeToggle } from "./ThemeToggle";
import { UnitToggle } from "./UnitToggle";
import { useWeather } from "./WeatherProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    selectedCity,
    unit,
    savedCities,
    isLoading,
    isError,
    error,
    locating,
    showLocationPrompt,
    locationError,
    supabaseConfigured,
    updatingUnit,
    selectCity,
    useLocation,
    removeCity,
    changeUnit,
  } = useWeather();

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-3">
          <div className="w-full max-w-xs">
            <AppNav />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <UnitToggle
              unit={unit}
              onChange={changeUnit}
              disabled={updatingUnit}
            />
          </div>
        </div>

        <CitySearch
          onSelect={selectCity}
          onUseLocation={useLocation}
          locating={locating}
        />

        <FavoritesBar
          cities={savedCities}
          selected={selectedCity}
          onSelect={selectCity}
          onRemove={removeCity}
        />

        {!supabaseConfigured && (
          <p className="font-mono text-[10px] text-warning/80 border border-warning/20 rounded px-3 py-2 bg-warning/5">
            Supabase not configured — favorites and unit sync disabled. Add env
            vars from .env.local.example
          </p>
        )}

        {showLocationPrompt && (
          <p className="font-mono text-[10px] text-text-muted border border-border rounded px-3 py-2 bg-bg-card/60">
            {locationError ?? "Unable to use current location"}. Search for a
            city or allow location access and tap the locate button.
          </p>
        )}

        {!selectedCity && locating && (
          <>
            <ForecastHeroSkeleton />
            <ForecastGridSkeleton />
          </>
        )}

        {selectedCity && isLoading && (
          <>
            <ForecastHeroSkeleton />
            <ForecastGridSkeleton />
          </>
        )}

        {selectedCity && isError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 font-mono text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error?.message ?? "Failed to load forecast"}
          </div>
        )}

        {children}

        <footer className="pt-8 border-t border-border font-mono text-[10px] text-text-dim text-center">
          Data:{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-dim hover:text-accent"
          >
            Open-Meteo
          </a>
        </footer>
      </div>
    </div>
  );
}
