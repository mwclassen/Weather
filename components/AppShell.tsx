"use client";

import { AlertCircle, MapPin } from "lucide-react";
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full min-w-0 sm:max-w-xs">
            <AppNav />
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-auto">
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
            Supabase not configured — favorites are stored in this browser only.
            Add env vars from .env.local.example to sync across devices.
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

        {showLocationPrompt && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-bg-card/70 px-6 py-16 text-center">
            <MapPin className="h-8 w-8 text-accent" aria-hidden />
            <div className="space-y-1">
              <p className="font-mono text-sm text-text">
                Choose a location to see the forecast
              </p>
              <p className="font-mono text-[11px] text-text-muted max-w-sm">
                {locationError
                  ? `${locationError}. Search for a city above, or allow location access and tap the locate button.`
                  : "Search for a city above, or allow location access and tap the locate button."}
              </p>
            </div>
          </div>
        )}

        {children}

        <footer className="pt-8 border-t border-border font-mono text-[10px] text-text-dim text-center">
          Data:{" "}
          <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-dim hover:text-accent"
          >
            OpenWeatherMap
          </a>
        </footer>
      </div>
    </div>
  );
}
