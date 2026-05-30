"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  SunMedium,
} from "lucide-react";
import {
  formatDateLong,
  formatTime,
  getDayDetail,
  isToday,
  weatherCodeToIcon,
  weatherCodeToLabel,
  type ForecastData,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import { WeatherIcon } from "./WeatherIcon";
import { HourlyTimeline } from "./HourlyTimeline";

export function DayDetailPanel({
  forecast,
  dayIndex,
  unit,
  cityName,
  onClose,
}: {
  forecast: ForecastData;
  dayIndex: number;
  unit: TemperatureUnit;
  cityName: string;
  onClose: () => void;
}) {
  const { timezone } = forecast;
  const detail = getDayDetail(forecast, dayIndex);
  const unitLabel = unit === "fahrenheit" ? "°F" : "°C";
  const today = isToday(detail.date, timezone);
  const tempSpread = Math.round(detail.tempMax - detail.tempMin);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-border bg-bg-elevated shadow-2xl animate-fade-up">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-bg-elevated/95 backdrop-blur px-5 sm:px-8 py-4 z-10">
          <div>
            <p className="font-mono text-[10px] text-accent uppercase tracking-wider">
              {today ? "Today" : "Day detail"} · {cityName}
            </p>
            <h2
              id="day-detail-title"
              className="text-lg sm:text-xl font-semibold text-text mt-0.5"
            >
              {formatDateLong(detail.date, timezone)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-accent/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-5 sm:gap-8">
            <WeatherIcon
              type={weatherCodeToIcon(detail.weatherCode)}
              className="w-16 h-16 sm:w-20 sm:h-20 shrink-0"
            />
            <div>
              <p className="text-xl sm:text-2xl font-medium text-text">
                {weatherCodeToLabel(detail.weatherCode)}
              </p>
              <div className="flex flex-wrap items-baseline gap-3 mt-2 font-mono">
                <span className="text-3xl sm:text-4xl font-bold text-accent tabular-nums">
                  {Math.round(detail.tempMax)}
                  {unitLabel}
                </span>
                <span className="text-lg sm:text-xl text-text-dim tabular-nums">
                  {Math.round(detail.tempMin)}
                  {unitLabel}
                </span>
                <span className="text-xs text-text-muted">
                  ±{tempSpread}
                  {unitLabel} range
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<Droplets className="w-4 h-4" />}
              label="Precip chance"
              value={`${detail.precipProbability ?? 0}%`}
            />
            <StatCard
              icon={<CloudRain className="w-4 h-4" />}
              label="Precip amount"
              value={`${detail.precipSum?.toFixed(1) ?? 0} mm`}
            />
            <StatCard
              icon={<Wind className="w-4 h-4" />}
              label="Max wind"
              value={`${Math.round(detail.windSpeedMax)} km/h`}
            />
            <StatCard
              icon={<SunMedium className="w-4 h-4" />}
              label="UV index"
              value={String(Math.round(detail.uvIndexMax ?? 0))}
            />
          </div>

          {detail.hourly.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 border-t border-border pt-6 sm:pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-accent-dim" />
                  <span className="font-mono text-xs text-text-muted">
                    Avg humidity:{" "}
                    {Math.round(
                      detail.hourly.reduce((s, h) => s + h.humidity, 0) /
                        detail.hourly.length
                    )}
                    %
                  </span>
                </div>
                <HourlyTimeline
                  detail={detail}
                  timezone={timezone}
                  unit={unit}
                />
              </div>

              <div>
                <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">
                  Hour-by-hour
                </h3>
                <ul className="space-y-1 max-h-64 lg:max-h-80 overflow-y-auto pr-1">
                  {detail.hourly.map((slot) => (
                    <li
                      key={slot.time}
                      className="grid grid-cols-[4rem_1.5rem_3rem_2.5rem_2.5rem_4rem] sm:grid-cols-[5rem_1.5rem_3.5rem_3rem_3rem_5rem] items-center gap-2 py-2 px-3 rounded-md hover:bg-bg-card font-mono text-xs"
                    >
                      <span className="text-text-muted">
                        {formatTime(slot.time, timezone)}
                      </span>
                      <WeatherIcon
                        type={weatherCodeToIcon(slot.weatherCode)}
                        className="w-4 h-4 justify-self-center"
                      />
                      <span className="text-text tabular-nums">
                        {Math.round(slot.temperature)}
                        {unitLabel}
                      </span>
                      <span className="text-text-dim">{slot.humidity}%</span>
                      <span className="text-text-dim">
                        {slot.precipProbability ?? 0}%
                      </span>
                      <span className="text-text-dim text-right">
                        {Math.round(slot.windSpeed)} km/h
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-3 sm:p-4">
      <div className="flex items-center gap-2 text-accent-dim mb-1">{icon}</div>
      <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
        {label}
      </p>
      <p className="font-mono text-sm text-text mt-0.5">{value}</p>
    </div>
  );
}
