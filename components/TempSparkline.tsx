"use client";

import type { TemperatureUnit } from "@/lib/open-meteo";

export function TempSparkline({
  temps,
  unit,
}: {
  temps: number[];
  unit: TemperatureUnit;
}) {
  if (temps.length < 2) return null;

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const width = 800;
  const height = 80;
  const padding = 8;

  const points = temps.map((t, i) => {
    const x = padding + (i / (temps.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((t - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const unitLabel = unit === "fahrenheit" ? "°F" : "°C";

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
          15-day temperature trend
        </span>
        <span className="font-mono text-xs text-text-dim">
          {Math.round(min)}
          {unitLabel} – {Math.round(max)}
          {unitLabel}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${points[0].split(",")[0]},${height} ${points.join(" ")} ${points[points.length - 1].split(",")[0]},${height}`}
          fill="url(#sparkGrad)"
        />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#00d4aa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {temps.map((t, i) => {
          const [x, y] = points[i].split(",").map(Number);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#0a0e14"
              stroke="#00d4aa"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
