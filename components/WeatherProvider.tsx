"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useForecast } from "@/hooks/useForecast";
import {
  useRemoveCity,
  useSaveCity,
  useSavedCities,
  useUpdatePreferences,
  useUserPreferences,
} from "@/hooks/useSavedCities";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ForecastData, GeoResult, TemperatureUnit } from "@/lib/open-meteo";
import type { SavedCity } from "@/lib/supabase/types";

interface WeatherContextValue {
  selectedCity: GeoResult | null;
  unit: TemperatureUnit;
  savedCities: SavedCity[];
  forecast: ForecastData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  locating: boolean;
  showLocationPrompt: boolean;
  locationError: string | null;
  isFavorite: boolean;
  savingFavorite: boolean;
  supabaseConfigured: boolean;
  updatingUnit: boolean;
  selectCity: (city: GeoResult) => void;
  useLocation: () => Promise<void>;
  removeCity: (id: string) => void;
  changeUnit: (unit: TemperatureUnit) => void;
  toggleFavorite: () => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const autoLocated = useRef(false);

  const { data: savedCities = [] } = useSavedCities();
  const { data: prefsUnit } = useUserPreferences();
  const saveCity = useSaveCity();
  const removeCityMutation = useRemoveCity();
  const updatePrefs = useUpdatePreferences();
  const {
    city: currentLocation,
    status: locationStatus,
    error: locationError,
    request: requestLocation,
  } = useCurrentLocation(true);

  useEffect(() => {
    if (prefsUnit) setUnit(prefsUnit);
  }, [prefsUnit]);

  useEffect(() => {
    if (!currentLocation || autoLocated.current) return;
    autoLocated.current = true;
    setSelectedCity((prev) => prev ?? currentLocation);
  }, [currentLocation]);

  const selectCity = useCallback((city: GeoResult) => {
    autoLocated.current = true;
    setSelectedCity(city);
  }, []);

  const useLocation = useCallback(async () => {
    const city = await requestLocation();
    if (city) {
      autoLocated.current = true;
      setSelectedCity(city);
    }
  }, [requestLocation]);

  const {
    data: forecast,
    isLoading,
    isError,
    error: forecastError,
  } = useForecast(
    selectedCity?.latitude ?? null,
    selectedCity?.longitude ?? null,
    unit
  );

  const locating = locationStatus === "loading";
  const showLocationPrompt =
    !selectedCity &&
    (locationStatus === "denied" ||
      locationStatus === "unavailable" ||
      locationStatus === "error");

  const isFavorite =
    selectedCity !== null &&
    savedCities.some(
      (c) =>
        c.latitude === selectedCity.latitude &&
        c.longitude === selectedCity.longitude
    );

  const changeUnit = useCallback(
    (newUnit: TemperatureUnit) => {
      setUnit(newUnit);
      if (isSupabaseConfigured()) {
        updatePrefs.mutate(newUnit);
      }
    },
    [updatePrefs]
  );

  const toggleFavorite = useCallback(() => {
    if (!selectedCity) return;

    if (isFavorite) {
      const saved = savedCities.find(
        (c) =>
          c.latitude === selectedCity.latitude &&
          c.longitude === selectedCity.longitude
      );
      if (saved) removeCityMutation.mutate(saved.id);
    } else if (isSupabaseConfigured()) {
      saveCity.mutate(selectedCity);
    }
  }, [selectedCity, isFavorite, savedCities, saveCity, removeCityMutation]);

  const removeCity = useCallback(
    (id: string) => {
      removeCityMutation.mutate(id);
    },
    [removeCityMutation]
  );

  const value = useMemo<WeatherContextValue>(
    () => ({
      selectedCity,
      unit,
      savedCities,
      forecast,
      isLoading,
      isError,
      error: (forecastError as Error | null) ?? null,
      locating,
      showLocationPrompt,
      locationError,
      isFavorite,
      savingFavorite: saveCity.isPending || removeCityMutation.isPending,
      supabaseConfigured: isSupabaseConfigured(),
      updatingUnit: updatePrefs.isPending,
      selectCity,
      useLocation,
      removeCity,
      changeUnit,
      toggleFavorite,
    }),
    [
      selectedCity,
      unit,
      savedCities,
      forecast,
      isLoading,
      isError,
      forecastError,
      locating,
      showLocationPrompt,
      locationError,
      isFavorite,
      saveCity.isPending,
      removeCityMutation.isPending,
      updatePrefs.isPending,
      selectCity,
      useLocation,
      removeCity,
      changeUnit,
      toggleFavorite,
    ]
  );

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error("useWeather must be used within WeatherProvider");
  }
  return ctx;
}
