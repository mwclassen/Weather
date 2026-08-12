"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClientId } from "@/lib/client-id";
import {
  readLocalCities,
  readLocalUnit,
  removeLocalCity,
  sameLocation,
  upsertLocalCity,
  writeLocalUnit,
} from "@/lib/local-favorites";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SavedCity, TemperatureUnit } from "@/lib/supabase/types";
import type { GeoResult } from "@/lib/open-meteo";

const SAVED_KEY = ["saved-cities"];
const PREFS_KEY = ["user-preferences"];

export function useSavedCities() {
  const hasWindow = typeof window !== "undefined";
  const clientId = hasWindow ? getClientId() : "";
  const supabaseReady = isSupabaseConfigured();

  return useQuery({
    queryKey: [...SAVED_KEY, clientId, supabaseReady ? "remote" : "local"],
    queryFn: async (): Promise<SavedCity[]> => {
      if (!supabaseReady) return readLocalCities();

      const supabase = getSupabase();
      if (!supabase || !clientId) return readLocalCities();

      const { data, error } = await supabase
        .from("saved_cities")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as SavedCity[];
    },
    enabled: hasWindow,
  });
}

export function useUserPreferences() {
  const hasWindow = typeof window !== "undefined";
  const clientId = hasWindow ? getClientId() : "";
  const supabaseReady = isSupabaseConfigured();

  return useQuery({
    queryKey: [...PREFS_KEY, clientId, supabaseReady ? "remote" : "local"],
    queryFn: async (): Promise<TemperatureUnit> => {
      if (!supabaseReady) return readLocalUnit() ?? "celsius";

      const supabase = getSupabase();
      if (!supabase || !clientId) return readLocalUnit() ?? "celsius";

      const { data, error } = await supabase
        .from("user_preferences")
        .select("temperature_unit")
        .eq("client_id", clientId)
        .maybeSingle();

      if (error) throw error;
      return (
        (data as { temperature_unit: TemperatureUnit } | null)
          ?.temperature_unit ??
        readLocalUnit() ??
        "celsius"
      );
    },
    enabled: hasWindow,
  });
}

export function useSaveCity() {
  const queryClient = useQueryClient();
  const clientId = getClientId();

  return useMutation({
    mutationFn: async (city: GeoResult) => {
      if (!isSupabaseConfigured()) {
        return upsertLocalCity(city, clientId || "local");
      }

      const supabase = getSupabase();
      if (!supabase) {
        return upsertLocalCity(city, clientId || "local");
      }

      const { error } = await supabase.from("saved_cities").upsert(
        {
          client_id: clientId,
          name: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          country: city.country,
          admin1: city.admin1 ?? null,
        },
        { onConflict: "client_id,latitude,longitude" }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_KEY });
    },
  });
}

export function useRemoveCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured()) {
        return removeLocalCity(id);
      }

      const supabase = getSupabase();
      if (!supabase) {
        return removeLocalCity(id);
      }

      const clientId = getClientId();
      const { error } = await supabase
        .from("saved_cities")
        .delete()
        .eq("id", id)
        .eq("client_id", clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_KEY });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const clientId = getClientId();

  return useMutation({
    mutationFn: async (unit: TemperatureUnit) => {
      writeLocalUnit(unit);

      if (!isSupabaseConfigured()) return;

      const supabase = getSupabase();
      if (!supabase) return;

      const { error } = await supabase.from("user_preferences").upsert(
        {
          client_id: clientId,
          temperature_unit: unit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFS_KEY });
    },
  });
}

export function savedCityToGeo(city: SavedCity): GeoResult {
  return {
    id: 0,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country ?? "",
    admin1: city.admin1 ?? undefined,
    timezone: "auto",
  };
}

export { sameLocation };
