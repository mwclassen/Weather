"use client";

import {
  formatHour,
  temperatureUnitLabel,
  weatherCodeToIcon,
  type DayDetail,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyTimeline({
  detail,
  timezone,
  unit,
}: {
  detail: DayDetail;
  timezone: string;
  unit: TemperatureUnit;
}) {
  const { hourly } = detail;
  if (hourly.length === 0) return null;

  const temps = hourly.map((h) => h.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const unitLabel = temperatureUnitLabel(unit);

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
        Hourly breakdown
      </h3>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max pb-2">
          {hourly.map((slot) => {
            const heightPct = ((slot.temperature - min) / range) * 100;
            return (
              <div
                key={slot.time}
                className="flex flex-col items-center w-14 gap-2"
              >
                <span className="font-mono text-[10px] text-text-muted">
                  {formatHour(slot.time, timezone)}
                </span>
                <div className="relative h-24 w-full flex items-end justify-center">
                  <div
                    className="w-6 rounded-t bg-accent/30 border border-accent/50 transition-all"
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-text tabular-nums">
                  {Math.round(slot.temperature)}
                  {unitLabel}
                </span>
                <WeatherIcon
                  type={weatherCodeToIcon(slot.weatherCode)}
                  className="w-4 h-4"
                />
                <span className="font-mono text-[9px] text-text-dim">
                  {slot.precipProbability ?? 0}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
