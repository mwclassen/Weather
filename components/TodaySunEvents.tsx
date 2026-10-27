"use client";

import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import {
  formatDuration,
  formatTime,
  getDayDetail,
  getDaylightMetrics,
  getFirstLastLight,
  getNextUpcomingEvent,
  getNowMinutesInTimezone,
  getTodayForecastIndex,
  shiftDateString,
  type ForecastData,
} from "@/lib/open-meteo";
import { SunEventsTable } from "./SunEventsTable";

const TICK_HOURS = [0, 6, 12, 18, 24];

export function TodaySunEvents({ forecast }: { forecast: ForecastData }) {
  const { timezone } = forecast;
  const todayIndex = getTodayForecastIndex(forecast, timezone);
  const detail = getDayDetail(forecast, todayIndex);
  const nextDate =
    todayIndex + 1 < forecast.daily.dates.length
      ? forecast.daily.dates[todayIndex + 1]
      : shiftDateString(detail.date, 1);
  const nextDaySunrise =
    todayIndex + 1 < forecast.daily.sunrise.length
      ? forecast.daily.sunrise[todayIndex + 1]
      : undefined;
  const nextDaySunset =
    todayIndex + 1 < forecast.daily.sunset.length
      ? forecast.daily.sunset[todayIndex + 1]
      : undefined;
  const nextDayLight =
    nextDaySunrise && nextDaySunset
      ? getFirstLastLight(forecast, nextDate, nextDaySunrise, nextDaySunset)
      : getFirstLastLight(
          forecast,
          nextDate,
          detail.sunrise,
          detail.sunset
        );

  const metrics = getDaylightMetrics(
    detail.sunrise,
    detail.sunset,
    detail.firstLight,
    detail.lastLight
  );
  const nowMinutes = getNowMinutesInTimezone(timezone);
  const nowPercent = (nowMinutes / (24 * 60)) * 100;

  const inUsableLight =
    nowMinutes >= metrics.firstLightMinutes &&
    nowMinutes <= metrics.lastLightMinutes;

  const nextSunEvent = getNextUpcomingEvent(
    [
      { type: "first-light", isoTime: detail.firstLight, label: "First light" },
      { type: "sunrise", isoTime: detail.sunrise, label: "Sunrise" },
      { type: "sunset", isoTime: detail.sunset, label: "Sunset" },
      { type: "last-light", isoTime: detail.lastLight, label: "Last light" },
      {
        type: "first-light",
        isoTime: nextDayLight.firstLight,
        label: "First light",
      },
    ],
    detail.date,
    timezone
  );

  const sunEventRows = [
    {
      id: "first-light",
      label: "First light",
      todayIso: detail.firstLight,
      isNext: nextSunEvent?.type === "first-light",
      countdown:
        nextSunEvent?.type === "first-light"
          ? {
              isoTime: nextSunEvent.isoTime,
              minutesUntil: nextSunEvent.minutesUntil,
            }
          : null,
      accentClass: "text-warning/80",
      icon: <Sunrise className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
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
      icon: <Sunset className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: "last-light",
      label: "Last light",
      todayIso: detail.lastLight,
      isNext: nextSunEvent?.type === "last-light",
      countdown:
        nextSunEvent?.type === "last-light"
          ? {
              isoTime: nextSunEvent.isoTime,
              minutesUntil: nextSunEvent.minutesUntil,
            }
          : null,
      accentClass: "text-orange-300",
      icon: <Moon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
    },
  ];

  const dawnWidth = Math.max(
    0,
    metrics.sunrisePercent - metrics.firstLightPercent
  );
  const duskWidth = Math.max(
    0,
    metrics.lastLightPercent - metrics.sunsetPercent
  );

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

      <div className="rounded-lg border border-border bg-bg-elevated/60 px-4 py-3">
        <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
          First light → last light
        </p>
        <p className="font-mono text-lg sm:text-xl font-semibold text-text mt-1 tabular-nums">
          {formatTime(detail.firstLight, timezone)}
          <span className="text-text-dim font-normal mx-2">→</span>
          {formatTime(detail.lastLight, timezone)}
        </p>
        <p className="font-mono text-xs text-text-muted mt-1">
          {formatDuration(metrics.usableLightMinutes)} of usable light · civil
          twilight
        </p>
      </div>

      <SunEventsTable
        rows={sunEventRows}
        timezone={timezone}
        caption="Today's first light, sunrise, sunset, and last light"
      />

      <div>
        <div className="mb-4">
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
            Daylight hours
          </h3>
          <p className="font-mono text-2xl font-semibold text-accent mt-1 tabular-nums">
            {formatDuration(metrics.daylightMinutes)}
            <span className="text-sm font-normal text-text-muted ml-2">
              sunrise to sunset
            </span>
          </p>
        </div>

        <div className="relative">
          <div className="relative h-14 sm:h-16 rounded-lg overflow-hidden border border-border/80">
            <div className="absolute inset-0 timeline-night" />
            <div
              className="absolute inset-y-0 twilight-gradient"
              style={{
                left: `${metrics.firstLightPercent}%`,
                width: `${dawnWidth}%`,
              }}
            />
            <div
              className="absolute inset-y-0 daylight-gradient"
              style={{
                left: `${metrics.sunrisePercent}%`,
                width: `${metrics.daylightPercent}%`,
              }}
            />
            <div
              className="absolute inset-y-0 twilight-gradient"
              style={{
                left: `${metrics.sunsetPercent}%`,
                width: `${duskWidth}%`,
              }}
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d={`M ${metrics.firstLightPercent} 38 Q 50 2 ${metrics.lastLightPercent} 38`}
                fill="none"
                stroke="rgba(255, 217, 61, 0.35)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className="absolute top-0 bottom-0 w-px bg-warning/40 z-[4]"
              style={{ left: `${metrics.firstLightPercent}%` }}
              title="First light"
            />
            <DaylightMarker
              percent={metrics.sunrisePercent}
              icon={<Sun className="w-3.5 h-3.5 text-warning" />}
              label="rise"
            />
            <DaylightMarker
              percent={metrics.sunsetPercent}
              icon={<Sunset className="w-3.5 h-3.5 text-orange-400/90" />}
              label="set"
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-orange-400/40 z-[4]"
              style={{ left: `${metrics.lastLightPercent}%` }}
              title="Last light"
            />

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
              style={{ left: `${nowPercent}%` }}
            >
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                  inUsableLight ? "bg-warning" : "bg-accent"
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/60">
          <div className="font-mono text-xs">
            <span className="text-text-dim">First light</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(detail.firstLight, timezone)}
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
            <span className="text-text-dim">Last light</span>
            <p className="text-text mt-0.5 tabular-nums">
              {formatTime(detail.lastLight, timezone)}
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
