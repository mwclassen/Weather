"use client";

import {
  formatDate,
  isToday,
  weatherCodeToIcon,
  weatherCodeToLabel,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import { WeatherIcon } from "./WeatherIcon";
import { Droplets, Wind } from "lucide-react";

export function DayCard({
  date,
  weatherCode,
  tempMax,
  tempMin,
  precip,
  wind,
  timezone,
  unit,
  index,
  selected,
  onSelect,
}: {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precip: number;
  wind: number;
  timezone: string;
  unit: TemperatureUnit;
  index: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const today = isToday(date, timezone);
  const unitLabel = unit === "fahrenheit" ? "°F" : "°C";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-shrink-0 w-36 sm:w-40 rounded-lg border bg-bg-card p-4 flex flex-col gap-3 animate-fade-up text-left cursor-pointer transition-all hover:border-accent/60 hover:shadow-[0_0_16px_var(--border-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        today ? "glow-border border-accent" : "border-border"
      } ${selected ? "ring-2 ring-accent border-accent" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`View details for ${formatDate(date, timezone)}`}
    >
      <div className="font-mono text-xs text-text-muted uppercase tracking-wider">
        {today ? (
          <span className="text-accent">Today</span>
        ) : (
          formatDate(date, timezone)
        )}
      </div>

      <WeatherIcon
        type={weatherCodeToIcon(weatherCode)}
        className="w-8 h-8 mx-auto"
      />

      <p className="text-center text-xs text-text-muted truncate">
        {weatherCodeToLabel(weatherCode)}
      </p>

      <div className="flex justify-center gap-3 font-mono">
        <span className="text-lg font-semibold text-text">
          {Math.round(tempMax)}
          {unitLabel}
        </span>
        <span className="text-sm text-text-dim self-end pb-0.5">
          {Math.round(tempMin)}
          {unitLabel}
        </span>
      </div>

      <div className="mt-auto space-y-1.5 font-mono text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-accent-dim" />
          <span>{precip ?? 0}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-accent-dim" />
          <span>{Math.round(wind)} km/h</span>
        </div>
      </div>
      <p className="font-mono text-[9px] text-text-dim text-center mt-1">
        tap for detail
      </p>
    </button>
  );
}
