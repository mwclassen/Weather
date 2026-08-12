import type { ForecastData, GeoResult, TemperatureUnit } from "@/lib/open-meteo";
import {
  fetchOpenWeatherForecast,
  searchOpenWeatherCities,
} from "@/lib/openweathermap";
import {
  fetchWeatherApiForecast,
  searchWeatherApiCities,
} from "@/lib/weatherapi";

function hasOpenWeatherKey(): boolean {
  return Boolean(
    process.env.OPENWEATHERMAP_KEY?.trim() ||
      process.env.OPENWEATHER_API_KEY?.trim()
  );
}

function hasWeatherApiKey(): boolean {
  return Boolean(process.env.WEATHERAPI_KEY?.trim());
}

function isKeyActivationError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("Invalid API key") ||
    message.includes("not activated") ||
    message.includes("401") ||
    message.includes("Invalid API-key")
  );
}

export async function searchCitiesWithProvider(
  query: string
): Promise<GeoResult[]> {
  const errors: string[] = [];

  if (hasOpenWeatherKey()) {
    try {
      return await searchOpenWeatherCities(query);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      if (!hasWeatherApiKey() || !isKeyActivationError(err)) {
        // Still try WeatherAPI if available; otherwise rethrow below.
      }
    }
  }

  if (hasWeatherApiKey()) {
    return searchWeatherApiCities(query);
  }

  throw new Error(
    errors[0] ??
      "No weather provider key configured. Set OPENWEATHERMAP_KEY or WEATHERAPI_KEY in .env.local."
  );
}

export async function fetchForecastWithProvider(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit
): Promise<ForecastData> {
  const errors: string[] = [];

  if (hasOpenWeatherKey()) {
    try {
      return await fetchOpenWeatherForecast(latitude, longitude, unit);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  if (hasWeatherApiKey()) {
    return fetchWeatherApiForecast(latitude, longitude, unit);
  }

  throw new Error(
    errors[0] ??
      "No weather provider key configured. Set OPENWEATHERMAP_KEY or WEATHERAPI_KEY in .env.local."
  );
}
