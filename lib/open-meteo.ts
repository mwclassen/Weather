export type TemperatureUnit = "celsius" | "fahrenheit";

export function isImperial(unit: TemperatureUnit): boolean {
  return unit === "fahrenheit";
}

export function temperatureUnitLabel(unit: TemperatureUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

export function formatWindSpeed(
  speed: number,
  unit: TemperatureUnit
): string {
  return isImperial(unit)
    ? `${Math.round(speed)} mph`
    : `${Math.round(speed)} km/h`;
}

const COMPASS_POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

/** Meteorological degrees (wind from) → 16-point compass. */
export function degreesToCompass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return COMPASS_POINTS[Math.round(normalized / 22.5) % 16];
}

export function formatWindDirection(
  degrees: number | null | undefined
): string | null {
  if (degrees == null || Number.isNaN(degrees)) return null;
  return degreesToCompass(degrees);
}

export function formatWind(
  speed: number,
  unit: TemperatureUnit,
  degrees?: number | null
): string {
  const speedLabel = formatWindSpeed(speed, unit);
  const dir = formatWindDirection(degrees);
  return dir ? `${speedLabel} ${dir}` : speedLabel;
}

function toFahrenheit(temp: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? temp : (temp * 9) / 5 + 32;
}

function fromFahrenheit(tempF: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? tempF : ((tempF - 32) * 5) / 9;
}

function toCelsius(temp: number, unit: TemperatureUnit): number {
  return unit === "celsius" ? temp : ((temp - 32) * 5) / 9;
}

function fromCelsius(tempC: number, unit: TemperatureUnit): number {
  return unit === "celsius" ? tempC : (tempC * 9) / 5 + 32;
}

/**
 * NWS heat index. Uses the Rothfusz regression at or above 80°F,
 * otherwise the Steadman approximation (near air temperature).
 */
export function computeHeatIndex(
  temperature: number,
  humidity: number,
  unit: TemperatureUnit
): number {
  const tempF = toFahrenheit(temperature, unit);
  const rh = Math.max(0, Math.min(100, humidity));
  return fromFahrenheit(heatIndexFahrenheit(tempF, rh), unit);
}

function heatIndexFahrenheit(tempF: number, rh: number): number {
  const simple =
    0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);

  if (tempF < 80 || simple < 80) {
    return simple;
  }

  let hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  } else if (rh > 85 && tempF <= 87) {
    hi += ((rh - 85) / 10) * ((87 - tempF) / 5);
  }

  return hi;
}

/**
 * Magnus-Tetens dew point from air temperature and relative humidity.
 */
export function computeDewPoint(
  temperature: number,
  humidity: number,
  unit: TemperatureUnit
): number {
  const tempC = toCelsius(temperature, unit);
  const rh = Math.max(0.1, Math.min(100, humidity));
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  return fromCelsius((b * gamma) / (a - gamma), unit);
}

export function formatPrecipSum(
  amount: number,
  unit: TemperatureUnit
): string {
  if (isImperial(unit)) {
    return `${amount.toFixed(2)} in`;
  }
  return `${amount.toFixed(1)} mm`;
}

export function precipAmountLabel(unit: TemperatureUnit): string {
  return isImperial(unit) ? "in" : "mm";
}

export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone: string;
}

export interface DailyForecast {
  dates: string[];
  weatherCodes: number[];
  tempMax: number[];
  tempMin: number[];
  feelsLikeMax: number[];
  heatIndexMax: number[];
  dewPointMax: number[];
  precipProbability: number[];
  precipSum: number[];
  windSpeedMax: number[];
  /** Degrees, wind origin at the day's strongest wind. */
  windDirection: (number | null)[];
  uvIndexMax: number[];
  sunrise: string[];
  sunset: string[];
}

export interface HourlyForecast {
  times: string[];
  temperatures: number[];
  feelsLike: number[];
  heatIndex: number[];
  dewPoint: number[];
  humidity: number[];
  precipProbability: number[];
  weatherCodes: number[];
  windSpeed: number[];
  windDirection: (number | null)[];
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  heatIndex: number;
  dewPoint: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  /** Degrees, wind origin (meteorological). */
  windDirection: number | null;
  time: string;
}

export interface ForecastData {
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather | null;
  daily: DailyForecast;
  hourly: HourlyForecast;
}

export interface DayDetail {
  index: number;
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  feelsLikeMax: number;
  heatIndexMax: number;
  dewPointMax: number;
  precipProbability: number;
  precipSum: number;
  windSpeedMax: number;
  windDirection: number | null;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  firstLight: string;
  lastLight: string;
  hourly: {
    time: string;
    temperature: number;
    heatIndex: number;
    dewPoint: number;
    humidity: number;
    precipProbability: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number | null;
  }[];
}

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query.trim(),
  });

  const res = await fetch(`/api/weather/search?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "City search failed");
  }

  return (await res.json()) as GeoResult[];
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = "celsius"
): Promise<ForecastData> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    unit,
  });

  const res = await fetch(`/api/weather/forecast?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Forecast fetch failed");
  }

  const forecast = (await res.json()) as ForecastData;
  if (!forecast.current) {
    forecast.current = getLocationCurrentWeather(forecast);
  }
  return forecast;
}

/** Interpret forecast local ISO times (with or without offset). */
export function forecastLocalIsoToUtcMs(
  localIso: string,
  utcOffsetSeconds: number
): number {
  if (/[Zz]$/.test(localIso) || /[+-]\d{2}:\d{2}$/.test(localIso)) {
    const ms = Date.parse(localIso);
    return Number.isNaN(ms) ? NaN : ms;
  }
  const asUtc = Date.parse(localIso.endsWith("Z") ? localIso : `${localIso}Z`);
  if (Number.isNaN(asUtc)) return NaN;
  return asUtc - utcOffsetSeconds * 1000;
}

/**
 * Current air temperature / feels-like for this forecast location ("now"),
 * not the daily high. Uses Open-Meteo current when present; otherwise the
 * nearest hourly slot in the location's local time.
 */
export function getLocationCurrentWeather(
  forecast: ForecastData
): CurrentWeather | null {
  if (forecast.current) {
    const current = forecast.current;
    return {
      ...current,
      heatIndex: current.heatIndex ?? current.temperature,
      dewPoint: current.dewPoint ?? current.temperature,
      windDirection: current.windDirection ?? null,
    };
  }

  const { hourly, utcOffsetSeconds } = forecast;
  if (!hourly.times.length) return null;

  const now = Date.now();
  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < hourly.times.length; i++) {
    const t = forecastLocalIsoToUtcMs(hourly.times[i], utcOffsetSeconds);
    if (Number.isNaN(t)) continue;
    const diff = Math.abs(t - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  const temperature = hourly.temperatures[bestIndex];
  const humidity = hourly.humidity[bestIndex];
  return {
    temperature,
    feelsLike: hourly.feelsLike[bestIndex] ?? temperature,
    heatIndex: hourly.heatIndex?.[bestIndex] ?? temperature,
    dewPoint: hourly.dewPoint?.[bestIndex] ?? temperature,
    humidity,
    weatherCode: hourly.weatherCodes[bestIndex],
    windSpeed: hourly.windSpeed[bestIndex],
    windDirection: hourly.windDirection?.[bestIndex] ?? null,
    time: hourly.times[bestIndex],
  };
}

/** True when the forecast grid point is for the selected city (Open-Meteo snaps coords). */
export function forecastMatchesLocation(
  forecast: ForecastData,
  location: { latitude: number; longitude: number },
  maxDegrees = 0.25
): boolean {
  return (
    Math.abs(forecast.latitude - location.latitude) <= maxDegrees &&
    Math.abs(forecast.longitude - location.longitude) <= maxDegrees
  );
}

export function getDayDetail(forecast: ForecastData, index: number): DayDetail {
  const { daily, hourly } = forecast;
  const date = daily.dates[index];

  const slots = hourly.times
    .map((time, i) => ({ time, i }))
    .filter(({ time }) => time.startsWith(date))
    .map(({ time, i }) => ({
      time,
      temperature: hourly.temperatures[i],
      heatIndex: hourly.heatIndex?.[i] ?? hourly.temperatures[i],
      dewPoint: hourly.dewPoint?.[i] ?? hourly.temperatures[i],
      humidity: hourly.humidity[i],
      precipProbability: hourly.precipProbability[i],
      weatherCode: hourly.weatherCodes[i],
      windSpeed: hourly.windSpeed[i],
      windDirection: hourly.windDirection?.[i] ?? null,
    }));

  return {
    index,
    date,
    weatherCode: daily.weatherCodes[index],
    tempMax: daily.tempMax[index],
    tempMin: daily.tempMin[index],
    feelsLikeMax: daily.feelsLikeMax[index],
    heatIndexMax: daily.heatIndexMax?.[index] ?? daily.tempMax[index],
    dewPointMax: daily.dewPointMax?.[index] ?? daily.tempMin[index],
    precipProbability: daily.precipProbability[index],
    precipSum: daily.precipSum[index],
    windSpeedMax: daily.windSpeedMax[index],
    windDirection: daily.windDirection?.[index] ?? null,
    uvIndexMax: daily.uvIndexMax[index],
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
    ...getFirstLastLight(
      forecast,
      date,
      daily.sunrise[index],
      daily.sunset[index]
    ),
    hourly: slots,
  };
}

export function formatDateLong(dateStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(dateStr + "T12:00:00"));
}

export function formatHour(timeStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: timezone,
  }).format(new Date(timeStr));
}

/** Minutes since midnight from an Open-Meteo local ISO time (e.g. 2024-06-01T06:42). */
export function parseLocalTimeMinutes(isoTime: string): number {
  const match = isoTime.match(/T(\d{2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export interface DaylightMetrics {
  sunriseMinutes: number;
  sunsetMinutes: number;
  firstLightMinutes: number;
  lastLightMinutes: number;
  daylightMinutes: number;
  usableLightMinutes: number;
  nightMinutes: number;
  daylightHours: number;
  /** 0–100 position on a 24h bar */
  sunrisePercent: number;
  sunsetPercent: number;
  firstLightPercent: number;
  lastLightPercent: number;
  daylightPercent: number;
  usableLightPercent: number;
}

export function getDaylightMetrics(
  sunrise: string,
  sunset: string,
  firstLight?: string,
  lastLight?: string
): DaylightMetrics {
  const dayMinutes = 24 * 60;
  const sunriseMinutes = parseLocalTimeMinutes(sunrise);
  const sunsetMinutes = parseLocalTimeMinutes(sunset);
  const firstLightMinutes = firstLight
    ? parseLocalTimeMinutes(firstLight)
    : sunriseMinutes;
  const lastLightMinutes = lastLight
    ? parseLocalTimeMinutes(lastLight)
    : sunsetMinutes;

  let daylightMinutes = sunsetMinutes - sunriseMinutes;
  if (daylightMinutes < 0) {
    daylightMinutes += dayMinutes;
  }

  let usableLightMinutes = lastLightMinutes - firstLightMinutes;
  if (usableLightMinutes < 0) {
    usableLightMinutes += dayMinutes;
  }

  const nightMinutes = dayMinutes - daylightMinutes;

  return {
    sunriseMinutes,
    sunsetMinutes,
    firstLightMinutes,
    lastLightMinutes,
    daylightMinutes,
    usableLightMinutes,
    nightMinutes,
    daylightHours: daylightMinutes / 60,
    sunrisePercent: (sunriseMinutes / dayMinutes) * 100,
    sunsetPercent: (sunsetMinutes / dayMinutes) * 100,
    firstLightPercent: (firstLightMinutes / dayMinutes) * 100,
    lastLightPercent: (lastLightMinutes / dayMinutes) * 100,
    daylightPercent: (daylightMinutes / dayMinutes) * 100,
    usableLightPercent: (usableLightMinutes / dayMinutes) * 100,
  };
}

const CIVIL_TWILIGHT_ZENITH = 96;

function sinDeg(degrees: number): number {
  return Math.sin((degrees * Math.PI) / 180);
}
function cosDeg(degrees: number): number {
  return Math.cos((degrees * Math.PI) / 180);
}
function tanDeg(degrees: number): number {
  return Math.tan((degrees * Math.PI) / 180);
}
function acosDeg(value: number): number {
  return (Math.acos(value) * 180) / Math.PI;
}
function asinDeg(value: number): number {
  return (Math.asin(value) * 180) / Math.PI;
}
function atanDeg(value: number): number {
  return (Math.atan(value) * 180) / Math.PI;
}

function wrapDegrees(value: number): number {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}

function wrapHours(value: number): number {
  const n = value % 24;
  return n < 0 ? n + 24 : n;
}

function dayOfYear(year: number, month: number, day: number): number {
  const n1 = Math.floor((275 * month) / 9);
  const n2 = Math.floor((month + 9) / 12);
  const n3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
  return n1 - n2 * n3 + day - 30;
}

/** NOAA/USNO solar event in UTC hours, or null if the sun never crosses zenith. */
function solarEventUtcHours(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  day: number,
  zenith: number,
  rising: boolean
): number | null {
  const N = dayOfYear(year, month, day);
  const lngHour = longitude / 15;
  const t = rising ? N + (6 - lngHour) / 24 : N + (18 - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * sinDeg(M) + 0.02 * sinDeg(2 * M) + 282.634;
  L = wrapDegrees(L);

  let rightAscension = atanDeg(0.91764 * tanDeg(L));
  rightAscension = wrapDegrees(rightAscension);
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension = (rightAscension + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * sinDeg(L);
  const cosDec = cosDeg(asinDeg(sinDec));
  const cosH =
    (cosDeg(zenith) - sinDec * sinDeg(latitude)) / (cosDec * cosDeg(latitude));

  if (cosH > 1 || cosH < -1 || Number.isNaN(cosH)) return null;

  let H = rising ? 360 - acosDeg(cosH) : acosDeg(cosH);
  H /= 15;

  const T = H + rightAscension - 0.06571 * t - 6.622;
  return wrapHours(T - lngHour);
}

function formatUtcOffset(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function utcHoursToOffsetIso(
  date: string,
  utcHours: number,
  utcOffsetSeconds: number
): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  let totalSeconds = Math.round(utcHours * 3600) + utcOffsetSeconds;
  while (totalSeconds < 0) totalSeconds += 86400;
  while (totalSeconds >= 86400) totalSeconds -= 86400;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${date}T${pad(hours)}:${pad(minutes)}:00${formatUtcOffset(utcOffsetSeconds)}`;
}

export function shiftDateString(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const wall = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
}

export interface CivilTwilight {
  firstLight: string;
  lastLight: string;
}

/** Civil dawn / dusk (sun 6° below the horizon). */
export function computeCivilTwilight(
  latitude: number,
  longitude: number,
  date: string,
  utcOffsetSeconds: number
): CivilTwilight | null {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [year, month, day] = parts;

  const dawn = solarEventUtcHours(
    latitude,
    longitude,
    year,
    month,
    day,
    CIVIL_TWILIGHT_ZENITH,
    true
  );
  const dusk = solarEventUtcHours(
    latitude,
    longitude,
    year,
    month,
    day,
    CIVIL_TWILIGHT_ZENITH,
    false
  );
  if (dawn == null || dusk == null) return null;

  return {
    firstLight: utcHoursToOffsetIso(date, dawn, utcOffsetSeconds),
    lastLight: utcHoursToOffsetIso(date, dusk, utcOffsetSeconds),
  };
}

export function getFirstLastLight(
  forecast: Pick<ForecastData, "latitude" | "longitude" | "utcOffsetSeconds">,
  date: string,
  sunrise: string,
  sunset: string
): CivilTwilight {
  const twilight = computeCivilTwilight(
    forecast.latitude,
    forecast.longitude,
    date,
    forecast.utcOffsetSeconds
  );
  return {
    firstLight:
      twilight?.firstLight ??
      offsetIsoTime(sunrise, -HUNTING_START_BEFORE_SUNRISE_MIN),
    lastLight:
      twilight?.lastLight ??
      offsetIsoTime(sunset, HUNTING_END_AFTER_SUNSET_MIN),
  };
}

export function getNextUpcomingEvent<T extends string>(
  candidates: { type: T; isoTime: string; label: string }[],
  date: string,
  timezone: string
): { type: T; isoTime: string; minutesUntil: number; label: string } | null {
  const now = Date.now();
  const todayStr = getTodayDateString(timezone);
  if (date < todayStr) return null;

  for (const event of candidates) {
    const ms = new Date(event.isoTime).getTime();
    if (Number.isNaN(ms) || ms <= now) continue;
    return {
      type: event.type,
      isoTime: event.isoTime,
      minutesUntil: Math.round((ms - now) / 60000),
      label: event.label,
    };
  }

  return null;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getNowMinutesInTimezone(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );
  return hour * 60 + minute;
}

export function getTodayDateString(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date());
}

export type SunEventType = "sunrise" | "sunset";

export interface NextSunEvent {
  type: SunEventType;
  isoTime: string;
  minutesUntil: number;
  label: string;
}

export function getNextSunEvent(
  sunrise: string,
  sunset: string,
  date: string,
  timezone: string,
  nextDaySunrise?: string
): NextSunEvent | null {
  const now = Date.now();
  const todayStr = getTodayDateString(timezone);
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();

  if (date < todayStr) return null;

  if (date > todayStr) {
    if (sunriseMs > now) {
      return {
        type: "sunrise",
        isoTime: sunrise,
        minutesUntil: Math.round((sunriseMs - now) / 60000),
        label: "Sunrise",
      };
    }
    return null;
  }

  if (now < sunriseMs) {
    return {
      type: "sunrise",
      isoTime: sunrise,
      minutesUntil: Math.round((sunriseMs - now) / 60000),
      label: "Sunrise",
    };
  }

  if (now < sunsetMs) {
    return {
      type: "sunset",
      isoTime: sunset,
      minutesUntil: Math.round((sunsetMs - now) / 60000),
      label: "Sunset",
    };
  }

  if (nextDaySunrise) {
    const nextMs = new Date(nextDaySunrise).getTime();
    if (nextMs > now) {
      return {
        type: "sunrise",
        isoTime: nextDaySunrise,
        minutesUntil: Math.round((nextMs - now) / 60000),
        label: "Sunrise",
      };
    }
  }

  return null;
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "now";
  const days = Math.floor(minutes / (24 * 60));
  const remainder = minutes % (24 * 60);
  if (days > 0) {
    return `${days}d ${formatDuration(remainder)}`;
  }
  return formatDuration(minutes);
}

/** Common US shooting-hour rule: 30 min before sunrise. Verify local regulations. */
export const HUNTING_START_BEFORE_SUNRISE_MIN = 30;
/** Common US shooting-hour rule: 30 min after sunset. Verify local regulations. */
export const HUNTING_END_AFTER_SUNSET_MIN = 30;

export function offsetIsoTime(isoTime: string, offsetMinutes: number): string {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return isoTime;
  date.setMinutes(date.getMinutes() + offsetMinutes);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const offsetMatch = isoTime.match(/([+-]\d{2}:\d{2}|Z)$/);
  if (offsetMatch) {
    let shiftMs = 0;
    if (offsetMatch[1] !== "Z") {
      const m = offsetMatch[1].match(/([+-])(\d{2}):(\d{2})/);
      if (m) {
        const sign = m[1] === "-" ? -1 : 1;
        shiftMs =
          sign * (parseInt(m[2], 10) * 3600 + parseInt(m[3], 10) * 60) * 1000;
      }
    }
    const wall = new Date(date.getTime() + shiftMs);
    return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}${offsetMatch[1]}`;
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface TimedEventCountdown {
  isoTime: string;
  minutesUntil: number;
}

export function getTimedEventCountdown(
  eventIso: string,
  nextDayEventIso: string | undefined,
  date: string,
  timezone: string
): TimedEventCountdown | null {
  const now = Date.now();
  const todayStr = getTodayDateString(timezone);
  const eventMs = new Date(eventIso).getTime();

  if (date < todayStr) return null;

  if (date > todayStr) {
    if (eventMs > now) {
      return {
        isoTime: eventIso,
        minutesUntil: Math.round((eventMs - now) / 60000),
      };
    }
    return null;
  }

  if (eventMs > now) {
    return {
      isoTime: eventIso,
      minutesUntil: Math.round((eventMs - now) / 60000),
    };
  }

  if (nextDayEventIso) {
    const nextMs = new Date(nextDayEventIso).getTime();
    if (nextMs > now) {
      return {
        isoTime: nextDayEventIso,
        minutesUntil: Math.round((nextMs - now) / 60000),
      };
    }
  }

  return null;
}

export type HuntEventType = "hunt-start" | "hunt-end";

export interface NextHuntEvent {
  type: HuntEventType;
  isoTime: string;
  minutesUntil: number;
  label: string;
}

export function getNextHuntingEvent(
  huntStart: string,
  huntEnd: string,
  date: string,
  timezone: string,
  nextDayHuntStart?: string
): NextHuntEvent | null {
  const now = Date.now();
  const todayStr = getTodayDateString(timezone);
  const startMs = new Date(huntStart).getTime();
  const endMs = new Date(huntEnd).getTime();

  if (date < todayStr) return null;

  if (date > todayStr) {
    if (startMs > now) {
      return {
        type: "hunt-start",
        isoTime: huntStart,
        minutesUntil: Math.round((startMs - now) / 60000),
        label: "Hunt start",
      };
    }
    return null;
  }

  if (now < startMs) {
    return {
      type: "hunt-start",
      isoTime: huntStart,
      minutesUntil: Math.round((startMs - now) / 60000),
      label: "Hunt start",
    };
  }

  if (now < endMs) {
    return {
      type: "hunt-end",
      isoTime: huntEnd,
      minutesUntil: Math.round((endMs - now) / 60000),
      label: "Hunt end",
    };
  }

  if (nextDayHuntStart) {
    const nextMs = new Date(nextDayHuntStart).getTime();
    if (nextMs > now) {
      return {
        type: "hunt-start",
        isoTime: nextDayHuntStart,
        minutesUntil: Math.round((nextMs - now) / 60000),
        label: "Hunt start",
      };
    }
  }

  return null;
}

export interface HuntingWindow {
  startIso: string;
  endIso: string;
  durationMinutes: number;
}

export function getHuntingWindow(
  sunrise: string,
  sunset: string
): HuntingWindow {
  const startIso = offsetIsoTime(sunrise, -HUNTING_START_BEFORE_SUNRISE_MIN);
  const endIso = offsetIsoTime(sunset, HUNTING_END_AFTER_SUNSET_MIN);
  const durationMinutes = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000
  );
  return { startIso, endIso, durationMinutes };
}

export function isWithinHuntingWindow(
  huntStart: string,
  huntEnd: string
): boolean {
  const now = Date.now();
  return now >= new Date(huntStart).getTime() && now <= new Date(huntEnd).getTime();
}

export function weatherCodeToLabel(code: number): string {
  // OpenWeatherMap condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) {
    if (code === 200 || code === 201 || code === 210) return "Thunderstorm";
    if (code >= 230) return "Thunderstorm with drizzle";
    return "Thunderstorm";
  }
  if (code >= 300 && code < 400) return "Drizzle";
  if (code >= 500 && code < 600) {
    if (code === 500) return "Light rain";
    if (code === 501) return "Moderate rain";
    if (code === 502 || code === 503 || code === 504) return "Heavy rain";
    if (code === 511) return "Freezing rain";
    if (code >= 520) return "Rain showers";
    return "Rain";
  }
  if (code >= 600 && code < 700) {
    if (code === 600) return "Light snow";
    if (code === 601) return "Snow";
    if (code === 602) return "Heavy snow";
    if (code >= 611 && code <= 616) return "Sleet";
    if (code >= 620) return "Snow showers";
    return "Snow";
  }
  if (code >= 700 && code < 800) {
    if (code === 701) return "Mist";
    if (code === 711) return "Smoke";
    if (code === 721) return "Haze";
    if (code === 731 || code === 761) return "Dust";
    if (code === 741) return "Fog";
    if (code === 751) return "Sand";
    if (code === 762) return "Ash";
    if (code === 771) return "Squall";
    if (code === 781) return "Tornado";
    return "Haze";
  }
  if (code === 800) return "Clear";
  if (code === 801) return "Few clouds";
  if (code === 802) return "Partly cloudy";
  if (code === 803) return "Broken clouds";
  if (code === 804) return "Overcast";
  return "Unknown";
}

export type WeatherIconType =
  | "sun"
  | "partly-cloudy"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

export function weatherCodeToIcon(code: number): WeatherIconType {
  // OpenWeatherMap condition codes
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 300 && code < 400) return "drizzle";
  if (code >= 500 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return "sun";
  if (code === 801 || code === 802) return "partly-cloudy";
  return "cloud";
}

export function formatCityLabel(city: GeoResult): string {
  const parts = [city.name];
  if (city.admin1) parts.push(city.admin1);
  parts.push(city.country);
  return parts.join(", ");
}

export function formatDate(dateStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(dateStr + "T12:00:00"));
}

export function formatTime(isoStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(isoStr));
}

export function isToday(dateStr: string, timezone: string): boolean {
  const today = getTodayDateString(timezone);
  return dateStr === today;
}

export function getTodayForecastIndex(
  forecast: ForecastData,
  timezone: string
): number {
  const todayStr = getTodayDateString(timezone);
  const idx = forecast.daily.dates.findIndex((d) => d === todayStr);
  return idx >= 0 ? idx : 0;
}
