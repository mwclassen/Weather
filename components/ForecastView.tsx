"use client";

import { ForecastHero } from "./ForecastHero";
import { ForecastGrid } from "./ForecastGrid";
import { TempSparkline } from "./TempSparkline";
import { useWeather } from "./WeatherProvider";

export function ForecastView() {
  const {
    selectedCity,
    forecast,
    unit,
    isFavorite,
    toggleFavorite,
    savingFavorite,
  } = useWeather();

  if (!selectedCity || !forecast) return null;

  return (
    <div className="space-y-6">
      <ForecastHero
        city={selectedCity}
        forecast={forecast}
        unit={unit}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        savingFavorite={savingFavorite}
      />

      <section>
        <h2 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-1">
          Daily outlook · 15 days
        </h2>
        <p className="font-mono text-[10px] text-text-dim mb-4">
          Click any day for hourly breakdown and details
        </p>
        <ForecastGrid
          forecast={forecast}
          unit={unit}
          cityName={selectedCity.name}
        />
      </section>

      <TempSparkline temps={forecast.daily.tempMax} unit={unit} />
    </div>
  );
}
