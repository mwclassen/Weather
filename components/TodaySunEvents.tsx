"use client";

import { Moon, Sun } from "lucide-react";
import {
  formatDuration,
  getDayDetail,
  getDaylightMetrics,
  getNextSunEvent,
  getNowMinutesInTimezone,
  getTodayForecastIndex,
  type ForecastData,
} from "@/lib/open-meteo";
import { SunEventsTable } from "./SunEventsTable";

const TICK_HOURS = [0, 6, 12, 18, 24];

export function TodaySunEvents({ forecast }: { forecast: ForecastData }) {
  const { timezone } = forecast;
  const todayIndex = getTodayForecastIndex(forecast, timezone);
  const detail = getDayDetail(forecast, todayIndex);
  const nextDaySunrise =
    todayIndex + 1 < forecast.daily.sunrise.length
      ? forecast.daily.sunrise[todayIndex + 1]
      : undefined;

  const metrics = getDaylightMetrics(detail.sunrise, detail.sunset);
  const nowMinutes = getNowMinutesInTimezone(timezone);
  const nowPercent = (nowMinutes / (24 * 60)) * 100;

  const inDaylight =
    nowMinutes >= metrics.sunriseMinutes &&
    nowMinutes <= metrics.sunsetMinutes;

  const nextSunEvent = getNextSunEvent(
    detail.sunrise,
    detail.sunset,
    detail.date,
    timezone,
    nextDaySunrise
  );

  const sunEventRows = [
    {
      id: "sunrise",
      label: "Sunrise",
      todayIso: detail.sunrise,
      isNext: nextSunEvent?.type === "sunrise",
      countdown:
        nextSunEvent?.type === "sunrise"
          ? {
              isoTime: nextSunEvent.isoTime,
              minutesUntil: nextSunEvent.minutesUntil,
            }
          : null,
      accentClass: "text-warning",
      icon: <Sun className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: "sunset",
      label: "Sunset",
      todayIso: detail.sunset,
      isNext: nextSunEvent?.type === "sunset",
      countdown:
        nextSunEvent?.type === "sunset"
          ? {
              isoTime: nextSunEvent.isoTime,
              minutesUntil: nextSunEvent.minutesUntil,
            }
          : null,
      accentClass: "text-orange-400",
      icon: <Moon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-bg-card p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="font-mono text-xs text-text-muted uppercase tracking-wider">
          Today · sun
        </h2>
        <p className="font-mono text-sm text-text-dim mt-1">
          Local times for your selected city · countdown on the next event only
        </p>
      </div>

      <SunEventsTable
        rows={sunEventRows}
        timezone={timezone}
        caption="Today's sunrise and sunset"
      />

      <div>
        <div className="mb-4">
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
            Daylight hours
          </h3>
          <p className="font-mono text-2xl font-semibold text-accent mt-1 tabular-nums">
            {formatDuration(metrics.daylightMinutes)}
            <span className="text-sm font-normal text-text-muted ml-2">
              of light today
            </span>
          </p>
        </div>

        <div className="relative">
          <div className="relative h-14 sm:h-16 rounded-lg overflow-hidden border border-border/80">
            <div
              className="absolute inset-y-0 left-0 timeline-night"
              style={{ width: `${metrics.sunrisePercent}%` }}
            />
            <div
              className="absolute inset-y-0 daylight-gradient"
              style={{
                left: `${metrics.sunrisePercent}%`,
                width: `${metrics.daylightPercent}%`,
              }}
            />
            <div
              className="absolute inset-y-0 right-0 timeline-night"
              style={{
                width: `${100 - metrics.sunsetPercent}%`,
              }}
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d={`M ${metrics.sunrisePercent} 38 Q 50 2 ${metrics.sunsetPercent} 38`}
                fill="none"
                stroke="rgba(255, 217, 61, 0.35)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <DaylightMarker
              percent={metrics.sunrisePercent}
              icon={<Sun className="w-3.5 h-3.5 text-warning" />}
              label="rise"
            />
            <DaylightMarker
              percent={metrics.sunsetPercent}
              icon={<Sun className="w-3.5 h-3.5 text-orange-400/90 rotate-180" />}
              label="set"
            />

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
              style={{ left: `${nowPercent}%` }}
            >
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                  inDaylight ? "bg-warning" : "bg-accent"
                }`}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-accent whitespace-nowrap">
                now
              </span>
            </div>
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

        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/60">
          <div className="font-mono text-xs">
            <span className="text-text-dim">Daylight</span>
            <p className="text-text mt-0.5">
              {formatDuration(metrics.daylightMinutes)}
            </p>
          </div>
          <div className="font-mono text-xs">
            <span className="text-text-dim">Night</span>
            <p className="text-text mt-0.5">
              {formatDuration(metrics.nightMinutes)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DaylightMarker({
  percent,
  icon,
  label,
}: {
  percent: number;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-0.5"
      style={{ left: `${percent}%` }}
    >
      <div className="rounded-full bg-bg/90 border border-border/80 p-1 shadow-sm">
        {icon}
      </div>
      <span className="font-mono text-[8px] text-text-dim uppercase">{label}</span>
    </div>
  );
}
