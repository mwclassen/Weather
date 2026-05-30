"use client";

import { Droplets, Star, Wind } from "lucide-react";
import {
  formatCityLabel,
  formatTime,
  weatherCodeToIcon,
  weatherCodeToLabel,
  type ForecastData,
  type GeoResult,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import { WeatherIcon } from "./WeatherIcon";

export function ForecastHero({
  city,
  forecast,
  unit,
  isFavorite,
  onToggleFavorite,
  savingFavorite,
}: {
  city: GeoResult;
  forecast: ForecastData;
  unit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  savingFavorite: boolean;
}) {
  const { current, timezone } = forecast;
  const unitLabel = unit === "fahrenheit" ? "°F" : "°C";

  const localTime = current
    ? formatTime(current.time, timezone)
    : formatTime(new Date().toISOString(), timezone);

  return (
    <header className="rounded-xl border border-border bg-bg-card/80 backdrop-blur p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text">
              {city.name}
            </h1>
            <button
              type="button"
              onClick={onToggleFavorite}
              disabled={savingFavorite}
              className="p-1 rounded transition-colors hover:bg-accent/10 disabled:opacity-50"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorite
                    ? "fill-accent text-accent"
                    : "text-text-muted hover:text-accent"
                }`}
              />
            </button>
          </div>
          <p className="font-mono text-sm text-text-muted mt-1">
            {formatCityLabel(city)}
          </p>
          <p className="font-mono text-xs text-text-dim mt-2">
            LOCAL {localTime} · TZ/{timezone}
          </p>
        </div>

        {current && (
          <div className="flex items-center gap-4 sm:gap-6">
            <WeatherIcon
              type={weatherCodeToIcon(current.weatherCode)}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
            <div>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-accent tabular-nums">
                {Math.round(current.temperature)}
                <span className="text-2xl text-accent-dim">{unitLabel}</span>
              </p>
              <p className="font-mono text-sm text-text-muted mt-1">
                {weatherCodeToLabel(current.weatherCode)}
              </p>
            </div>
          </div>
        )}
      </div>

      {current && (
        <div className="flex gap-6 mt-6 pt-4 border-t border-border font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-accent-dim" />
            {current.humidity}% humidity
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-accent-dim" />
            {Math.round(current.windSpeed)} km/h wind
          </span>
          <span className="text-text-dim">
            {forecast.latitude.toFixed(2)}°, {forecast.longitude.toFixed(2)}°
          </span>
        </div>
      )}
    </header>
  );
}

export function ForecastHeroSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-8">
      <div className="h-8 w-48 skeleton rounded mb-2" />
      <div className="h-4 w-64 skeleton rounded mb-6" />
      <div className="h-16 w-32 skeleton rounded" />
    </div>
  );
}
