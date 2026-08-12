"use client";

import { useState } from "react";
import type { ForecastData, TemperatureUnit } from "@/lib/open-meteo";
import { DayCard } from "./DayCard";
import { DayDetailPanel } from "./DayDetailPanel";

export function ForecastGrid({
  forecast,
  unit,
  cityName,
}: {
  forecast: ForecastData;
  unit: TemperatureUnit;
  cityName: string;
}) {
  const { daily, timezone } = forecast;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          {daily.dates.map((date, i) => (
            <DayCard
              key={date}
              date={date}
              weatherCode={daily.weatherCodes[i]}
              tempMax={daily.tempMax[i]}
              tempMin={daily.tempMin[i]}
              feelsLikeMax={daily.feelsLikeMax[i]}
              precip={daily.precipProbability[i]}
              wind={daily.windSpeedMax[i]}
              timezone={timezone}
              unit={unit}
              index={i}
              selected={selectedIndex === i}
              onSelect={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <DayDetailPanel
          forecast={forecast}
          dayIndex={selectedIndex}
          dayCount={daily.dates.length}
          unit={unit}
          cityName={cityName}
          onClose={() => setSelectedIndex(null)}
          onDayChange={setSelectedIndex}
        />
      )}
    </>
  );
}

export function ForecastGridSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-36 h-52 rounded-lg border border-border skeleton"
        />
      ))}
    </div>
  );
}
