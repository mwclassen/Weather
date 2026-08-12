import type {
  ForecastData,
  GeoResult,
  TemperatureUnit,
} from "@/lib/open-meteo";

const WEATHERAPI_BASE = "https://api.weatherapi.com/v1";

function getApiKey(): string {
  const key = process.env.WEATHERAPI_KEY?.trim();
  if (!key) {
    throw new Error(
      "WEATHERAPI_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  return key;
}

interface WeatherApiCondition {
  text: string;
  code: number;
}

interface WeatherApiSearchItem {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id?: string;
}

interface WeatherApiHour {
  time: string;
  time_epoch: number;
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  humidity: number;
  chance_of_rain: number;
  chance_of_snow: number;
  condition: WeatherApiCondition;
  wind_mph: number;
  wind_kph: number;
}

interface WeatherApiDay {
  date: string;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    maxwind_mph: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    totalprecip_in: number;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
    condition: WeatherApiCondition;
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
  };
  hour: WeatherApiHour[];
}

interface WeatherApiForecastResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated: string;
    last_updated_epoch: number;
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;
    condition: WeatherApiCondition;
    humidity: number;
    wind_mph: number;
    wind_kph: number;
  };
  forecast: {
    forecastday: WeatherApiDay[];
  };
}

/** Convert "06:42 AM" on YYYY-MM-DD into local ISO `YYYY-MM-DDTHH:MM`. */
export function weatherApiAstroToIso(date: string, timeStr: string): string {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return `${date}T12:00`;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }

  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toLocalIso(time: string): string {
  return time.includes("T") ? time.slice(0, 16) : time.replace(" ", "T").slice(0, 16);
}

function formatUtcOffset(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toOffsetIso(localIso: string, utcOffsetSeconds: number): string {
  const base = localIso.length === 16 ? `${localIso}:00` : localIso;
  return `${base}${formatUtcOffset(utcOffsetSeconds)}`;
}

function utcOffsetFromHour(hour: WeatherApiHour): number {
  const localAsUtc = Date.parse(`${toLocalIso(hour.time)}Z`) / 1000;
  return Math.round(localAsUtc - hour.time_epoch);
}

/** Map WeatherAPI condition codes into OpenWeatherMap-style buckets our UI icons understand. */
function toOwmLikeCode(code: number): number {
  if (code === 1000) return 800;
  if (code === 1003) return 802;
  if (code === 1006) return 803;
  if (code === 1009) return 804;
  if (code === 1030 || code === 1135 || code === 1147) return 741;
  if (code === 1087 || code === 1273 || code === 1276 || code === 1279 || code === 1282)
    return 200;
  if (
    code === 1066 ||
    code === 1114 ||
    code === 1117 ||
    (code >= 1210 && code <= 1225) ||
    (code >= 1255 && code <= 1264)
  )
    return 600;
  if (code === 1069 || (code >= 1204 && code <= 1207) || (code >= 1249 && code <= 1252))
    return 611;
  if (code === 1072 || code === 1150 || code === 1153 || code === 1168 || code === 1171)
    return 300;
  return 500;
}

export async function searchWeatherApiCities(
  query: string
): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    key: getApiKey(),
    q: query.trim(),
  });

  const res = await fetch(`${WEATHERAPI_BASE}/search.json?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `WeatherAPI search failed (${res.status})${body ? `: ${body}` : ""}`
    );
  }

  const data = (await res.json()) as WeatherApiSearchItem[];
  if (!Array.isArray(data)) return [];

  return data.slice(0, 8).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.lat,
    longitude: r.lon,
    country: r.country,
    admin1: r.region || undefined,
    timezone: r.tz_id ?? "auto",
  }));
}

export async function fetchWeatherApiForecast(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = "celsius"
): Promise<ForecastData> {
  const imperial = unit === "fahrenheit";
  const params = new URLSearchParams({
    key: getApiKey(),
    q: `${latitude},${longitude}`,
    days: "14",
    aqi: "no",
    alerts: "no",
  });

  const res = await fetch(`${WEATHERAPI_BASE}/forecast.json?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `WeatherAPI forecast failed (${res.status})${body ? `: ${body}` : ""}`
    );
  }

  const data = (await res.json()) as WeatherApiForecastResponse;
  const days = data.forecast?.forecastday ?? [];
  const firstHour = days[0]?.hour?.[0];
  const utcOffsetSeconds = firstHour ? utcOffsetFromHour(firstHour) : 0;

  const dates: string[] = [];
  const weatherCodes: number[] = [];
  const tempMax: number[] = [];
  const tempMin: number[] = [];
  const feelsLikeMax: number[] = [];
  const precipProbability: number[] = [];
  const precipSum: number[] = [];
  const windSpeedMax: number[] = [];
  const uvIndexMax: number[] = [];
  const sunrise: string[] = [];
  const sunset: string[] = [];

  const hourlyTimes: string[] = [];
  const hourlyTemps: number[] = [];
  const hourlyFeels: number[] = [];
  const hourlyHumidity: number[] = [];
  const hourlyPrecip: number[] = [];
  const hourlyCodes: number[] = [];
  const hourlyWind: number[] = [];

  for (const day of days) {
    dates.push(day.date);
    weatherCodes.push(toOwmLikeCode(day.day.condition.code));
    tempMax.push(imperial ? day.day.maxtemp_f : day.day.maxtemp_c);
    tempMin.push(imperial ? day.day.mintemp_f : day.day.mintemp_c);
    precipProbability.push(
      Math.max(day.day.daily_chance_of_rain ?? 0, day.day.daily_chance_of_snow ?? 0)
    );
    precipSum.push(imperial ? day.day.totalprecip_in : day.day.totalprecip_mm);
    windSpeedMax.push(imperial ? day.day.maxwind_mph : day.day.maxwind_kph);
    uvIndexMax.push(day.day.uv ?? 0);
    sunrise.push(
      toOffsetIso(weatherApiAstroToIso(day.date, day.astro.sunrise), utcOffsetSeconds)
    );
    sunset.push(
      toOffsetIso(weatherApiAstroToIso(day.date, day.astro.sunset), utcOffsetSeconds)
    );

    let dayFeelsMax = imperial ? day.day.maxtemp_f : day.day.maxtemp_c;

    for (const hour of day.hour) {
      const feels = imperial ? hour.feelslike_f : hour.feelslike_c;
      dayFeelsMax = Math.max(dayFeelsMax, feels);

      hourlyTimes.push(toOffsetIso(toLocalIso(hour.time), utcOffsetSeconds));
      hourlyTemps.push(imperial ? hour.temp_f : hour.temp_c);
      hourlyFeels.push(feels);
      hourlyHumidity.push(hour.humidity);
      hourlyPrecip.push(
        Math.max(hour.chance_of_rain ?? 0, hour.chance_of_snow ?? 0)
      );
      hourlyCodes.push(toOwmLikeCode(hour.condition.code));
      hourlyWind.push(imperial ? hour.wind_mph : hour.wind_kph);
    }

    feelsLikeMax.push(dayFeelsMax);
  }

  const current = data.current
    ? {
        temperature: imperial ? data.current.temp_f : data.current.temp_c,
        feelsLike: imperial
          ? data.current.feelslike_f
          : data.current.feelslike_c,
        humidity: data.current.humidity,
        weatherCode: toOwmLikeCode(data.current.condition.code),
        windSpeed: imperial ? data.current.wind_mph : data.current.wind_kph,
        time: toOffsetIso(toLocalIso(data.current.last_updated), utcOffsetSeconds),
      }
    : null;

  return {
    latitude: data.location.lat,
    longitude: data.location.lon,
    timezone: data.location.tz_id,
    utcOffsetSeconds,
    current,
    daily: {
      dates,
      weatherCodes,
      tempMax,
      tempMin,
      feelsLikeMax,
      precipProbability,
      precipSum,
      windSpeedMax,
      uvIndexMax,
      sunrise,
      sunset,
    },
    hourly: {
      times: hourlyTimes,
      temperatures: hourlyTemps,
      feelsLike: hourlyFeels,
      humidity: hourlyHumidity,
      precipProbability: hourlyPrecip,
      weatherCodes: hourlyCodes,
      windSpeed: hourlyWind,
    },
  };
}
