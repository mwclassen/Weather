import type { GeoResult } from "@/lib/open-meteo";

const REVERSE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

export class GeolocationUnavailableError extends Error {
  constructor(message = "Geolocation is not supported") {
    super(message);
    this.name = "GeolocationUnavailableError";
  }
}

export class GeolocationPermissionError extends Error {
  constructor(message = "Location permission denied") {
    super(message);
    this.name = "GeolocationPermissionError";
  }
}

export async function getBrowserCoordinates(): Promise<{
  latitude: number;
  longitude: number;
}> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new GeolocationUnavailableError();
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeolocationPermissionError(err.message));
        } else {
          reject(new Error(err.message || "Unable to get location"));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 5 * 60_000,
      }
    );
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeoResult> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });

  try {
    const res = await fetch(`${REVERSE_URL}?${params}`);
    if (!res.ok) throw new Error("Reverse geocode failed");

    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };

    const name =
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      "Current location";

    return {
      id: 0,
      name,
      latitude,
      longitude,
      country: data.countryName ?? "",
      admin1: data.principalSubdivision || undefined,
      timezone: "auto",
    };
  } catch {
    return {
      id: 0,
      name: "Current location",
      latitude,
      longitude,
      country: "",
      timezone: "auto",
    };
  }
}

export async function resolveCurrentLocation(): Promise<GeoResult> {
  const { latitude, longitude } = await getBrowserCoordinates();
  return reverseGeocode(latitude, longitude);
}
