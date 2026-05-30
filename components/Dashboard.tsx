"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { CitySearch } from "./CitySearch";
import { FavoritesBar } from "./FavoritesBar";
import { ForecastHero, ForecastHeroSkeleton } from "./ForecastHero";
import { ForecastGrid, ForecastGridSkeleton } from "./ForecastGrid";
import { TempSparkline } from "./TempSparkline";
import { ThemeToggle } from "./ThemeToggle";
import { TodaySunEvents } from "./TodaySunEvents";
import { UnitToggle } from "./UnitToggle";
import { useForecast } from "@/hooks/useForecast";
import {
  useRemoveCity,
  useSaveCity,
  useSavedCities,
  useUpdatePreferences,
  useUserPreferences,
} from "@/hooks/useSavedCities";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { GeoResult, TemperatureUnit } from "@/lib/open-meteo";

export function Dashboard() {
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");

  const { data: savedCities = [] } = useSavedCities();
  const { data: prefsUnit } = useUserPreferences();
  const saveCity = useSaveCity();
  const removeCity = useRemoveCity();
  const updatePrefs = useUpdatePreferences();

  useEffect(() => {
    if (prefsUnit) setUnit(prefsUnit);
  }, [prefsUnit]);

  const {
    data: forecast,
    isLoading,
    isError,
    error,
  } = useForecast(
    selectedCity?.latitude ?? null,
    selectedCity?.longitude ?? null,
    unit
  );

  const isFavorite =
    selectedCity !== null &&
    savedCities.some(
      (c) =>
        c.latitude === selectedCity.latitude &&
        c.longitude === selectedCity.longitude
    );

  const handleUnitChange = useCallback(
    (newUnit: TemperatureUnit) => {
      setUnit(newUnit);
      if (isSupabaseConfigured()) {
        updatePrefs.mutate(newUnit);
      }
    },
    [updatePrefs]
  );

  const handleToggleFavorite = useCallback(() => {
    if (!selectedCity) return;

    if (isFavorite) {
      const saved = savedCities.find(
        (c) =>
          c.latitude === selectedCity.latitude &&
          c.longitude === selectedCity.longitude
      );
      if (saved) removeCity.mutate(saved.id);
    } else if (isSupabaseConfigured()) {
      saveCity.mutate(selectedCity);
    }
  }, [selectedCity, isFavorite, savedCities, saveCity, removeCity]);

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-row flex-nowrap items-center justify-end gap-2">
          <ThemeToggle />
          <UnitToggle
            unit={unit}
            onChange={handleUnitChange}
            disabled={updatePrefs.isPending}
          />
        </div>

        <CitySearch onSelect={setSelectedCity} />

        <FavoritesBar
          cities={savedCities}
          selected={selectedCity}
          onSelect={setSelectedCity}
          onRemove={(id) => removeCity.mutate(id)}
        />

        {!isSupabaseConfigured() && (
          <p className="font-mono text-[10px] text-warning/80 border border-warning/20 rounded px-3 py-2 bg-warning/5">
            Supabase not configured — favorites and unit sync disabled. Add env
            vars from .env.local.example
          </p>
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
            {(error as Error)?.message ?? "Failed to load forecast"}
          </div>
        )}

        {selectedCity && forecast && (
          <div className="space-y-6">
            <ForecastHero
              city={selectedCity}
              forecast={forecast}
              unit={unit}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              savingFavorite={saveCity.isPending || removeCity.isPending}
            />

            <TodaySunEvents forecast={forecast} />

            <section>
              <h2 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-1">
                Daily outlook · 15 days
              </h2>
              <p className="font-mono text-[10px] text-text-dim mb-4">
                Click any day for hourly breakdown and details
              </p>
              <ForecastGrid
                forecast={forecast}
                unit={unit}
                cityName={selectedCity.name}
              />
            </section>

            <TempSparkline temps={forecast.daily.tempMax} unit={unit} />
          </div>
        )}

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
