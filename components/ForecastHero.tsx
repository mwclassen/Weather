"use client";

import { useEffect, useState } from "react";
import { Droplets, Navigation, Star, ThermometerSun, Wind } from "lucide-react";
import {
  formatCityLabel,
  formatTime,
  formatWind,
  formatWindDirection,
  getLocationCurrentWeather,
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
  const { timezone } = forecast;
  const current = getLocationCurrentWeather(forecast);
  const unitLabel = temperatureUnitLabel(unit);
  const localTime = useLiveLocalTime(timezone);

  return (
    <header className="rounded-xl border border-border bg-bg-card/80 backdrop-blur p-6 sm:p-8">
      {current ? (
        <>
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-4 w-full">
            <div className="flex items-center gap-1 min-w-0 lg:justify-self-start">
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

            <div className="flex items-center justify-between gap-4 lg:contents">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-accent tabular-nums lg:justify-self-center px-1">
                {localTime}
              </span>

              <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
                <WeatherIcon
                  type={weatherCodeToIcon(current.weatherCode)}
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                />
                <div className="flex flex-col items-end leading-none">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-1">
                    Now
                  </span>
                  <span
                    className="font-mono text-2xl sm:text-3xl font-bold text-accent tabular-nums"
                    title="Current air temperature"
                  >
                    {Math.round(current.temperature)}
                    <span className="text-lg sm:text-xl text-accent-dim">
                      {unitLabel}
                    </span>
                  </span>
                  <span
                    className="font-mono text-[10px] sm:text-xs text-danger tabular-nums mt-1"
                    title="Apparent temperature (heat index / wind chill)"
                  >
                    Feels like {Math.round(current.feelsLike)}
                    {unitLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 mt-2">
            <p className="font-mono text-sm text-text-muted truncate">
              {formatCityLabel(city)}
            </p>
            <p className="font-mono text-sm text-text-muted lg:text-right">
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
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-4 border-t border-border font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-accent-dim" />
            {current.humidity}% humidity
          </span>
          <span
            className="flex items-center gap-1.5"
            title="Heat index from air temperature and humidity"
          >
            <ThermometerSun className="w-3.5 h-3.5 text-accent-dim" />
            Heat index {Math.round(current.heatIndex ?? current.temperature)}
            {unitLabel}
          </span>
          <span
            className="flex items-center gap-1.5"
            title={
              current.windDirection != null
                ? `Wind from ${formatWindDirection(current.windDirection)}`
                : "Wind speed"
            }
          >
            <Wind className="w-3.5 h-3.5 text-accent-dim" />
            {formatWind(current.windSpeed, unit, current.windDirection)}
            {current.windDirection != null && (
              <Navigation
                className="w-3 h-3 text-accent-dim shrink-0"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
                aria-hidden
              />
            )}
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
