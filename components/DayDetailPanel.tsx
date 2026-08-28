"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  X,
  Droplets,
  Wind,
  Thermometer,
  ThermometerSun,
  CloudRain,
  SunMedium,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from "lucide-react";
import {
  formatDateLong,
  formatPrecipSum,
  formatTime,
  formatWind,
  getDayDetail,
  isToday,
  precipAmountLabel,
  temperatureUnitLabel,
  weatherCodeToIcon,
  weatherCodeToLabel,
  type ForecastData,
  type TemperatureUnit,
} from "@/lib/open-meteo";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { WeatherIcon } from "./WeatherIcon";
import { HourlyTimeline } from "./HourlyTimeline";

export function DayDetailPanel({
  forecast,
  dayIndex,
  dayCount,
  unit,
  cityName,
  onClose,
  onDayChange,
}: {
  forecast: ForecastData;
  dayIndex: number;
  dayCount: number;
  unit: TemperatureUnit;
  cityName: string;
  onClose: () => void;
  onDayChange: (index: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { timezone } = forecast;
  const detail = getDayDetail(forecast, dayIndex);
  const unitLabel = temperatureUnitLabel(unit);
  const today = isToday(detail.date, timezone);
  const tempSpread = Math.round(detail.tempMax - detail.tempMin);

  const canGoPrev = dayIndex > 0;
  const canGoNext = dayIndex < dayCount - 1;

  const goPrevious = useCallback(() => {
    if (canGoPrev) onDayChange(dayIndex - 1);
  }, [canGoPrev, dayIndex, onDayChange]);

  const goNext = useCallback(() => {
    if (canGoNext) onDayChange(dayIndex + 1);
  }, [canGoNext, dayIndex, onDayChange]);

  const swipe = useSwipeNavigation({
    onPrevious: goPrevious,
    onNext: goNext,
    enabled: canGoPrev || canGoNext,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrevious();
      if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrevious, goNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [dayIndex]);

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

      <div
        ref={panelRef}
        className="relative w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-border bg-bg-elevated shadow-2xl animate-fade-up touch-pan-y"
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-bg-elevated/95 backdrop-blur px-5 sm:px-8 py-4 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <NavButton
              direction="prev"
              disabled={!canGoPrev}
              onClick={goPrevious}
              label="Previous day"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-accent uppercase tracking-wider">
                {today ? "Today" : "Day detail"} · {cityName}
              </p>
              <h2
                id="day-detail-title"
                className="text-lg sm:text-xl font-semibold text-text mt-0.5 truncate"
              >
                {formatDateLong(detail.date, timezone)}
              </h2>
              <p className="font-mono text-[10px] text-text-dim mt-0.5">
                Day {dayIndex + 1} of {dayCount} · swipe or use arrows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NavButton
              direction="next"
              disabled={!canGoNext}
              onClick={goNext}
              label="Next day"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-accent/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          key={dayIndex}
          className="p-5 sm:p-8 space-y-6 sm:space-y-8 animate-fade-up"
        >
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
                <span className="text-sm text-danger tabular-nums">
                  feels {Math.round(detail.feelsLikeMax)}
                  {unitLabel}
                </span>
                <span className="text-sm text-warning tabular-nums">
                  HI {Math.round(detail.heatIndexMax)}
                  {unitLabel}
                </span>
                <span className="text-xs text-text-muted">
                  ±{tempSpread}
                  {unitLabel} range
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              icon={<Droplets className="w-4 h-4" />}
              label="Precip chance"
              value={`${detail.precipProbability ?? 0}%`}
            />
            <StatCard
              icon={<CloudRain className="w-4 h-4" />}
              label={`Rainfall (${precipAmountLabel(unit)})`}
              value={formatPrecipSum(detail.precipSum ?? 0, unit)}
            />
            <StatCard
              icon={<Wind className="w-4 h-4" />}
              label="Max wind"
              value={formatWind(
                detail.windSpeedMax,
                unit,
                detail.windDirection
              )}
            />
            <StatCard
              icon={<ThermometerSun className="w-4 h-4" />}
              label="Heat index"
              value={`${Math.round(detail.heatIndexMax)}${unitLabel}`}
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
                  <li className="grid grid-cols-[3.5rem_1.25rem_2.75rem_2.75rem_2.25rem_1fr] sm:grid-cols-[4.5rem_1.5rem_3.25rem_3.25rem_2.5rem_1fr] items-center gap-2 px-3 pb-1 font-mono text-[10px] text-text-dim uppercase tracking-wider">
                    <span>Time</span>
                    <span />
                    <span>Temp</span>
                    <span>HI</span>
                    <span>Rain</span>
                    <span className="text-right">Wind</span>
                  </li>
                  {detail.hourly.map((slot) => (
                    <li
                      key={slot.time}
                      className="grid grid-cols-[3.5rem_1.25rem_2.75rem_2.75rem_2.25rem_1fr] sm:grid-cols-[4.5rem_1.5rem_3.25rem_3.25rem_2.5rem_1fr] items-center gap-2 py-2 px-3 rounded-md hover:bg-bg-card font-mono text-xs"
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
                      <span
                        className="text-warning tabular-nums"
                        title="Heat index"
                      >
                        {Math.round(slot.heatIndex)}
                        {unitLabel}
                      </span>
                      <span className="text-text-dim">
                        {slot.precipProbability ?? 0}%
                      </span>
                      <span className="text-text-dim text-right flex items-center justify-end gap-1">
                        {slot.windDirection != null && (
                          <Navigation
                            className="w-3 h-3 shrink-0"
                            style={{
                              transform: `rotate(${slot.windDirection}deg)`,
                            }}
                            aria-hidden
                          />
                        )}
                        {formatWind(slot.windSpeed, unit, slot.windDirection)}
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

function NavButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-accent/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
      <Icon className="w-5 h-5" />
    </button>
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
