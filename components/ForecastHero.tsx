"use client";

import { useEffect, useState } from "react";
import { Droplets, Star, Wind } from "lucide-react";
import {
  formatCityLabel,
  formatTime,
  formatWindSpeed,
  temperatureUnitLabel,
  weatherCodeToIcon,
  weatherCodeToLabel,
  type ForecastData,
  type GeoResult,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import {
  formatCoordinates,
  getDeviceMapUrl,
  openDeviceMap,
} from "@/lib/maps";
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
  const unitLabel = temperatureUnitLabel(unit);
  const localTime = useLiveLocalTime(timezone);

  return (
    <header className="rounded-xl border border-border bg-bg-card/80 backdrop-blur p-6 sm:p-8">
      {current ? (
        <>
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-4 w-full">
            <div className="flex items-center gap-1 min-w-0 sm:justify-self-start">
              <h1 className="text-xl sm:text-3xl font-semibold text-text truncate">
                {city.name}
              </h1>
              <button
                type="button"
                onClick={onToggleFavorite}
                disabled={savingFavorite}
                className="group relative z-10 flex items-center justify-center min-w-11 min-h-11 -m-1 rounded transition-colors hover:bg-accent/10 disabled:opacity-50 shrink-0 touch-manipulation"
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                aria-pressed={isFavorite}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? "fill-current text-accent"
                      : "fill-none text-text-muted group-hover:text-accent"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 sm:contents">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-accent tabular-nums sm:justify-self-center px-1">
                {localTime}
              </span>

              <div className="flex items-center gap-2 sm:gap-3 sm:justify-self-end">
                <WeatherIcon
                  type={weatherCodeToIcon(current.weatherCode)}
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                />
                <span className="font-mono text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                  {Math.round(current.temperature)}
                  <span className="text-lg sm:text-xl text-accent-dim">
                    {unitLabel}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">
            <p className="font-mono text-sm text-text-muted truncate">
              {formatCityLabel(city)}
            </p>
            <p className="font-mono text-sm text-text-muted sm:text-right">
              {weatherCodeToLabel(current.weatherCode)}
            </p>
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text">
              {city.name}
            </h1>
            <button
              type="button"
              onClick={onToggleFavorite}
              disabled={savingFavorite}
              className="group relative z-10 flex items-center justify-center min-w-11 min-h-11 -m-1 rounded transition-colors hover:bg-accent/10 disabled:opacity-50 shrink-0 touch-manipulation"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={isFavorite}
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  isFavorite
                    ? "fill-current text-accent"
                    : "fill-none text-text-muted group-hover:text-accent"
                }`}
              />
            </button>
          </div>
          <p className="font-mono text-sm text-text-muted mt-1">
            {formatCityLabel(city)}
          </p>
        </div>
      )}

      {current && (
        <div className="flex gap-6 mt-6 pt-4 border-t border-border font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-accent-dim" />
            {current.humidity}% humidity
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-accent-dim" />
            {formatWindSpeed(current.windSpeed, unit)} wind
          </span>
          <a
            href={getDeviceMapUrl(
              forecast.latitude,
              forecast.longitude,
              city.name
            )}
            onClick={(e) => {
              e.preventDefault();
              openDeviceMap(forecast.latitude, forecast.longitude, city.name);
            }}
            className="text-text-dim hover:text-accent underline-offset-2 hover:underline transition-colors"
            title="Open in Maps"
            aria-label={`Open ${city.name} in Maps (${formatCoordinates(forecast.latitude, forecast.longitude)})`}
          >
            {formatCoordinates(forecast.latitude, forecast.longitude)}
          </a>
        </div>
      )}
    </header>
  );
}

function useLiveLocalTime(timezone: string): string {
  const [time, setTime] = useState(() =>
    formatTime(new Date().toISOString(), timezone)
  );

  useEffect(() => {
    const tick = () =>
      setTime(formatTime(new Date().toISOString(), timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return time;
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
