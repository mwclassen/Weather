"use client";

import {
  formatCountdown,
  formatTime,
  type TimedEventCountdown,
} from "@/lib/open-meteo";

export interface SunEventRow {
  id: string;
  label: string;
  todayIso: string;
  countdown: TimedEventCountdown | null;
  isNext?: boolean;
  accentClass?: string;
  active?: boolean;
  icon?: React.ReactNode;
}

export function SunEventsTable({
  rows,
  timezone,
  caption,
}: {
  rows: SunEventRow[];
  timezone: string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full font-mono text-xs">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-bg-elevated text-left text-text-dim uppercase tracking-wider text-[10px]">
            <th className="px-4 py-2.5 font-medium">Event</th>
            <th className="px-4 py-2.5 font-medium">Today</th>
            <th className="px-4 py-2.5 font-medium">Next</th>
            <th className="px-4 py-2.5 font-medium text-right">In</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const showCountdown = row.isNext && row.countdown;
            const nextIso = showCountdown ? row.countdown?.isoTime : null;
            const minutesUntil = showCountdown
              ? (row.countdown?.minutesUntil ?? null)
              : null;

            return (
              <tr
                key={row.id}
                className={`border-b border-border/60 last:border-0 ${
                  row.isNext || row.active
                    ? "bg-accent/5"
                    : "hover:bg-bg-elevated/50"
                }`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-2 ${
                      row.isNext
                        ? (row.accentClass ?? "text-accent")
                        : (row.accentClass ?? "text-text")
                    }`}
                  >
                    {row.icon}
                    {row.label}
                    {row.isNext && (
                      <span className="text-[9px] text-accent uppercase tracking-wider border border-accent/30 rounded px-1.5 py-0.5">
                        next
                      </span>
                    )}
                    {row.active && !row.isNext && (
                      <span className="text-[9px] text-accent uppercase tracking-wider border border-accent/30 rounded px-1.5 py-0.5">
                        active
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted tabular-nums">
                  {formatTime(row.todayIso, timezone)}
                </td>
                <td className="px-4 py-3 text-text tabular-nums">
                  {nextIso ? formatTime(nextIso, timezone) : "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-semibold ${
                    row.isNext ? (row.accentClass ?? "text-accent") : "text-text-dim"
                  }`}
                >
                  {minutesUntil !== null
                    ? formatCountdown(minutesUntil)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
