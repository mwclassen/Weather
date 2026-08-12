"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchForecast,
  type TemperatureUnit,
} from "@/lib/open-meteo";

export function useForecast(
  latitude: number | null,
  longitude: number | null,
  unit: TemperatureUnit
) {
  return useQuery({
    queryKey: ["forecast", latitude, longitude, unit],
    queryFn: () => fetchForecast(latitude!, longitude!, unit),
    enabled: latitude !== null && longitude !== null,
    // Keep the header "now" temp fresh for the selected location.
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
