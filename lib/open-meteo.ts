export type TemperatureUnit = "celsius" | "fahrenheit";

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
  precipProbability: number[];
  precipSum: number[];
  windSpeedMax: number[];
  uvIndexMax: number[];
  sunrise: string[];
  sunset: string[];
}

export interface HourlyForecast {
  times: string[];
  temperatures: number[];
  humidity: number[];
  precipProbability: number[];
  weatherCodes: number[];
  windSpeed: number[];
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  time: string;
}

export interface ForecastData {
  latitude: number;
  longitude: number;
  timezone: string;
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
  precipProbability: number;
  precipSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  hourly: {
    time: string;
    temperature: number;
    humidity: number;
    precipProbability: number;
    weatherCode: number;
    windSpeed: number;
  }[];
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    name: query.trim(),
    count: "8",
    language: "en",
    format: "json",
  });

  const res = await fetch(`${GEO_URL}?${params}`);
  if (!res.ok) throw new Error("City search failed");

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map(
    (r: {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      admin1?: string;
      timezone: string;
    }) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
      timezone: r.timezone,
    })
  );
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = "celsius"
): Promise<ForecastData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    forecast_days: "15",
    timezone: "auto",
    temperature_unit: unit,
    current: "temperature_2m,relative_humidity_2m,weathercode,windspeed_10m",
    daily: [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "windspeed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "weathercode",
      "windspeed_10m",
    ].join(","),
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error("Forecast fetch failed");

  const data = await res.json();
  const daily = data.daily;
  const hourly = data.hourly;

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: data.current
      ? {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          weatherCode: data.current.weathercode,
          windSpeed: data.current.windspeed_10m,
          time: data.current.time,
        }
      : null,
    daily: {
      dates: daily.time,
      weatherCodes: daily.weathercode,
      tempMax: daily.temperature_2m_max,
      tempMin: daily.temperature_2m_min,
      precipProbability: daily.precipitation_probability_max,
      precipSum: daily.precipitation_sum,
      windSpeedMax: daily.windspeed_10m_max,
      uvIndexMax: daily.uv_index_max,
      sunrise: daily.sunrise,
      sunset: daily.sunset,
    },
    hourly: {
      times: hourly.time,
      temperatures: hourly.temperature_2m,
      humidity: hourly.relative_humidity_2m,
      precipProbability: hourly.precipitation_probability,
      weatherCodes: hourly.weathercode,
      windSpeed: hourly.windspeed_10m,
    },
  };
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
      humidity: hourly.humidity[i],
      precipProbability: hourly.precipProbability[i],
      weatherCode: hourly.weatherCodes[i],
      windSpeed: hourly.windSpeed[i],
    }));

  return {
    index,
    date,
    weatherCode: daily.weatherCodes[index],
    tempMax: daily.tempMax[index],
    tempMin: daily.tempMin[index],
    precipProbability: daily.precipProbability[index],
    precipSum: daily.precipSum[index],
    windSpeedMax: daily.windSpeedMax[index],
    uvIndexMax: daily.uvIndexMax[index],
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
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
  daylightMinutes: number;
  nightMinutes: number;
  daylightHours: number;
  /** 0–100 position on a 24h bar */
  sunrisePercent: number;
  sunsetPercent: number;
  daylightPercent: number;
}

export function getDaylightMetrics(
  sunrise: string,
  sunset: string
): DaylightMetrics {
  const dayMinutes = 24 * 60;
  const sunriseMinutes = parseLocalTimeMinutes(sunrise);
  const sunsetMinutes = parseLocalTimeMinutes(sunset);

  let daylightMinutes = sunsetMinutes - sunriseMinutes;
  if (daylightMinutes < 0) {
    daylightMinutes += dayMinutes;
  }

  const nightMinutes = dayMinutes - daylightMinutes;

  return {
    sunriseMinutes,
    sunsetMinutes,
    daylightMinutes,
    nightMinutes,
    daylightHours: daylightMinutes / 60,
    sunrisePercent: (sunriseMinutes / dayMinutes) * 100,
    sunsetPercent: (sunsetMinutes / dayMinutes) * 100,
    daylightPercent: (daylightMinutes / dayMinutes) * 100,
  };
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
  const map: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
    99: "Thunderstorm + heavy hail",
  };
  return map[code] ?? "Unknown";
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
  if (code === 0) return "sun";
  if (code <= 2) return "partly-cloudy";
  if (code === 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 57) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 86) return "snow";
  return "thunder";
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
