"use client";

import { ForecastHero } from "./ForecastHero";
import { TodayHuntingEvents } from "./TodayHuntingEvents";
import { useWeather } from "./WeatherProvider";

export function HuntingView() {
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

      <TodayHuntingEvents forecast={forecast} />
    </div>
  );
}
