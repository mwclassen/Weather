export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
}

/** Opens the device's default maps app (Apple Maps, Google Maps, etc.). */
export function getDeviceMapUrl(
  latitude: number,
  longitude: number,
  label?: string
): string {
  const coords = `${latitude},${longitude}`;
  if (label) {
    return `geo:${coords}?q=${encodeURIComponent(label)}@${coords}`;
  }
  return `geo:${coords}?q=${coords}`;
}

/** Web fallback when geo: is not handled (most desktop browsers). */
export function getWebMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function openDeviceMap(
  latitude: number,
  longitude: number,
  label?: string
): void {
  const geoUrl = getDeviceMapUrl(latitude, longitude, label);
  const webUrl = getWebMapUrl(latitude, longitude);

  if (typeof window === "undefined") return;

  const isLikelyMobile =
    "ontouchstart" in window || window.matchMedia("(hover: none)").matches;

  if (isLikelyMobile) {
    window.location.href = geoUrl;
    return;
  }

  const popup = window.open(webUrl, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.href = geoUrl;
  }
}
