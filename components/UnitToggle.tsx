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
    <div className="flex flex-row flex-nowrap items-center shrink-0 font-mono text-xs border border-border rounded-md overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("celsius")}
        className={`px-2 sm:px-3 py-1.5 transition-colors ${
          unit === "celsius"
            ? "bg-accent font-semibold"
            : "text-text-muted hover:text-text"
        }`}
        style={unit === "celsius" ? { color: "var(--on-accent)" } : undefined}
      >
        °C
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("fahrenheit")}
        className={`px-2 sm:px-3 py-1.5 transition-colors ${
          unit === "fahrenheit"
            ? "bg-accent font-semibold"
            : "text-text-muted hover:text-text"
        }`}
        style={unit === "fahrenheit" ? { color: "var(--on-accent)" } : undefined}
      >
        °F
      </button>
    </div>
  );
}
