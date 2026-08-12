import type { GeoResult } from "@/lib/open-meteo";
import type { SavedCity, TemperatureUnit } from "@/lib/supabase/types";

const CITIES_KEY = "weather_saved_cities";
const PREFS_KEY = "weather_temperature_unit";

export function sameLocation(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
  epsilon = 1e-4
): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < epsilon &&
    Math.abs(a.longitude - b.longitude) < epsilon
  );
}

export function readLocalCities(): SavedCity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalCities(cities: SavedCity[]) {
  localStorage.setItem(CITIES_KEY, JSON.stringify(cities));
}

export function upsertLocalCity(city: GeoResult, clientId: string): SavedCity[] {
  const existing = readLocalCities();
  const index = existing.findIndex((c) => sameLocation(c, city));
  const next: SavedCity = {
    id: index >= 0 ? existing[index].id : crypto.randomUUID(),
    client_id: clientId,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country || null,
    admin1: city.admin1 ?? null,
    created_at:
      index >= 0 ? existing[index].created_at : new Date().toISOString(),
  };

  const cities =
    index >= 0
      ? existing.map((c, i) => (i === index ? next : c))
      : [...existing, next];

  writeLocalCities(cities);
  return cities;
}

export function removeLocalCity(id: string): SavedCity[] {
  const cities = readLocalCities().filter((c) => c.id !== id);
  writeLocalCities(cities);
  return cities;
}

export function readLocalUnit(): TemperatureUnit | null {
  if (typeof window === "undefined") return null;
  const unit = localStorage.getItem(PREFS_KEY);
  return unit === "celsius" || unit === "fahrenheit" ? unit : null;
}

export function writeLocalUnit(unit: TemperatureUnit) {
  localStorage.setItem(PREFS_KEY, unit);
}
