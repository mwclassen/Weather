"use client";

import type { TemperatureUnit } from "@/lib/open-meteo";

export function UnitToggle({
  unit,
  onChange,
  disabled,
}: {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 font-mono text-xs border border-border rounded-md overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("celsius")}
        className={`px-3 py-1.5 transition-colors ${
          unit === "celsius"
            ? "bg-accent text-bg font-semibold"
            : "text-text-muted hover:text-text"
        }`}
      >
        °C
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("fahrenheit")}
        className={`px-3 py-1.5 transition-colors ${
          unit === "fahrenheit"
            ? "bg-accent text-bg font-semibold"
            : "text-text-muted hover:text-text"
        }`}
      >
        °F
      </button>
    </div>
  );
}
