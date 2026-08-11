"use client";

import { Crosshair } from "lucide-react";
import {
  formatDuration,
  formatTime,
  getDayDetail,
  getDaylightMetrics,
  getHuntingWindow,
  getNextHuntingEvent,
  getTodayForecastIndex,
  HUNTING_END_AFTER_SUNSET_MIN,
  HUNTING_START_BEFORE_SUNRISE_MIN,
  isWithinHuntingWindow,
  offsetIsoTime,
  type ForecastData,
} from "@/lib/open-meteo";
import { SunEventsTable } from "./SunEventsTable";

const TICK_HOURS = [0, 6, 12, 18, 24];

export function TodayHuntingEvents({ forecast }: { forecast: ForecastData }) {
  const { timezone } = forecast;
  const todayIndex = getTodayForecastIndex(forecast, timezone);
  const detail = getDayDetail(forecast, todayIndex);
  const nextDaySunrise =
    todayIndex + 1 < forecast.daily.sunrise.length
      ? forecast.daily.sunrise[todayIndex + 1]
      : undefined;

  const metrics = getDaylightMetrics(detail.sunrise, detail.sunset);
  const hunting = getHuntingWindow(detail.sunrise, detail.sunset);
  const nextHuntStart = nextDaySunrise
    ? offsetIsoTime(nextDaySunrise, -HUNTING_START_BEFORE_SUNRISE_MIN)
    : undefined;

  const nextHuntEvent = getNextHuntingEvent(
    hunting.startIso,
    hunting.endIso,
    detail.date,
    timezone,
    nextHuntStart
  );

  const huntingActive = isWithinHuntingWindow(
    hunting.startIso,
    hunting.endIso
  );

  const huntStartMin =
    metrics.sunriseMinutes - HUNTING_START_BEFORE_SUNRISE_MIN;
  const huntEndMin = metrics.sunsetMinutes + HUNTING_END_AFTER_SUNSET_MIN;
  const huntStartPct = (huntStartMin / (24 * 60)) * 100;
  const huntEndPct = (huntEndMin / (24 * 60)) * 100;
  const huntWidthPct = ((huntEndMin - huntStartMin) / (24 * 60)) * 100;

  const huntingRows = [
    {
      id: "hunt-start",
      label: "Hunt start",
      todayIso: hunting.startIso,
      isNext: nextHuntEvent?.type === "hunt-start",
      countdown:
        nextHuntEvent?.type === "hunt-start"
          ? {
              isoTime: nextHuntEvent.isoTime,
              minutesUntil: nextHuntEvent.minutesUntil,
            }
          : null,
      accentClass: "text-accent",
      active: huntingActive,
      icon: <Crosshair className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: "hunt-end",
      label: "Hunt end",
      todayIso: hunting.endIso,
      isNext: nextHuntEvent?.type === "hunt-end",
      countdown:
        nextHuntEvent?.type === "hunt-end"
          ? {
              isoTime: nextHuntEvent.isoTime,
              minutesUntil: nextHuntEvent.minutesUntil,
            }
          : null,
      accentClass: "text-accent-dim",
      active: huntingActive,
      icon: (
        <Crosshair className="w-3.5 h-3.5 shrink-0 rotate-90" strokeWidth={1.5} />
      ),
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-bg-card p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="font-mono text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-accent-dim" />
            Legal hunting times
          </h2>
          <p className="font-mono text-sm text-text-dim mt-1 max-w-lg">
            Estimated using the common {HUNTING_START_BEFORE_SUNRISE_MIN} min
            before sunrise / {HUNTING_END_AFTER_SUNSET_MIN} min after sunset
            rule. Always verify regulations for your state and species.
          </p>
        </div>
        {huntingActive && (
          <span className="font-mono text-[10px] text-accent border border-accent/40 bg-accent/10 rounded px-2 py-1 shrink-0">
            HUNTING OPEN
          </span>
        )}
      </div>

      <p className="font-mono text-xs text-text-muted">
        Today&apos;s window:{" "}
        <span className="text-text">
          {formatTime(hunting.startIso, timezone)} –{" "}
          {formatTime(hunting.endIso, timezone)}
        </span>
        <span className="text-text-dim ml-2">
          ({formatDuration(hunting.durationMinutes)})
        </span>
      </p>

      <SunEventsTable
        rows={huntingRows}
        timezone={timezone}
        caption="Today's legal hunting start and end"
      />

      <div>
        <div className="mb-4">
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
            Hunting window today
          </h3>
          <p className="font-mono text-2xl font-semibold text-accent mt-1 tabular-nums">
            {formatDuration(hunting.durationMinutes)}
            <span className="text-sm font-normal text-text-muted ml-2">
              legal window
            </span>
          </p>
        </div>

        <div className="relative">
          <div className="relative h-14 sm:h-16 rounded-lg overflow-hidden border border-border/80">
            <div className="absolute inset-0 timeline-night" />
            <div
              className="absolute inset-y-0 daylight-gradient opacity-40"
              style={{
                left: `${metrics.sunrisePercent}%`,
                width: `${metrics.daylightPercent}%`,
              }}
            />
            <div
              className="absolute inset-y-1 border border-accent/50 bg-accent/20 rounded-sm z-[2]"
              style={{
                left: `${Math.max(0, huntStartPct)}%`,
                width: `${Math.min(100 - Math.max(0, huntStartPct), huntWidthPct)}%`,
              }}
              title="Legal hunting window"
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-warning/70 z-[3]"
              style={{ left: `${metrics.sunrisePercent}%` }}
              title="Sunrise"
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-orange-400/70 z-[3]"
              style={{ left: `${metrics.sunsetPercent}%` }}
              title="Sunset"
            />
          </div>

          <div className="relative mt-2 h-4">
            {TICK_HOURS.map((h) => {
              const pct = (h / 24) * 100;
              const label =
                h === 0 || h === 24
                  ? "12a"
                  : h === 12
                    ? "12p"
                    : h < 12
                      ? `${h}a`
                      : `${h - 12}p`;
              return (
                <span
                  key={h}
                  className="absolute font-mono text-[9px] text-text-dim -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/60">
          <div className="font-mono text-xs">
            <span className="text-text-dim">Hunt start</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(hunting.startIso, timezone)}
            </p>
          </div>
          <div className="font-mono text-xs">
            <span className="text-text-dim">Sunrise</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(detail.sunrise, timezone)}
            </p>
          </div>
          <div className="font-mono text-xs">
            <span className="text-text-dim">Sunset</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(detail.sunset, timezone)}
            </p>
          </div>
          <div className="font-mono text-xs">
            <span className="text-text-dim">Hunt end</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(hunting.endIso, timezone)}
            </p>
          </div>
        </div>

        <p className="font-mono text-[10px] text-text-dim mt-4">
          Window spans ~{Math.round(huntStartPct)}%–{Math.round(huntEndPct)}% of
          the day on the timeline above. Markers show sunrise and sunset.
        </p>
      </div>
    </section>
  );
}
