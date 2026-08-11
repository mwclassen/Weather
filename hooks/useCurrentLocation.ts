"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GeolocationPermissionError,
  GeolocationUnavailableError,
  resolveCurrentLocation,
} from "@/lib/geolocation";
import type { GeoResult } from "@/lib/open-meteo";

export type LocationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

export function useCurrentLocation(auto = true) {
  const [city, setCity] = useState<GeoResult | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const request = useCallback(async (): Promise<GeoResult | null> => {
    setStatus("loading");
    setError(null);

    try {
      const result = await resolveCurrentLocation();
      setCity(result);
      setStatus("ready");
      return result;
    } catch (err) {
      if (err instanceof GeolocationPermissionError) {
        setStatus("denied");
        setError("Location permission denied");
      } else if (err instanceof GeolocationUnavailableError) {
        setStatus("unavailable");
        setError("Geolocation is not supported on this device");
      } else {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Unable to get location"
        );
      }
      return null;
    }
  }, []);

  useEffect(() => {
    if (!auto || autoStarted.current) return;
    autoStarted.current = true;
    void request();
  }, [auto, request]);

  return { city, status, error, request };
}
