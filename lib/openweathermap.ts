import type {
  ForecastData,
  GeoResult,
  TemperatureUnit,
} from "@/lib/open-meteo";

const OWM_BASE = "https://api.openweathermap.org";

function getApiKey(): string {
  const key =
    process.env.OPENWEATHERMAP_KEY?.trim() ||
    process.env.OPENWEATHER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "OPENWEATHERMAP_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  return key;
}

function owmUnits(unit: TemperatureUnit): "metric" | "imperial" {
  return unit === "fahrenheit" ? "imperial" : "metric";
}

/** OWM metric wind is m/s; our UI expects km/h for celsius mode. */
function windSpeed(raw: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? raw : raw * 3.6;
}

function precipAmount(mmOrInFromList: number, unit: TemperatureUnit): number {
  // 2.5 forecast rain/snow volumes are always in mm
  if (unit === "fahrenheit") return mmOrInFromList * 0.0393701;
  return mmOrInFromList;
}

function formatUtcOffset(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toOffsetIsoFromUnix(
  unixSec: number,
  utcOffsetSeconds: number
): string {
  const wall = new Date((unixSec + utcOffsetSeconds) * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:00${formatUtcOffset(utcOffsetSeconds)}`;
}

function dateStringFromUnix(unixSec: number, utcOffsetSeconds: number): string {
  const wall = new Date((unixSec + utcOffsetSeconds) * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
}

function wallClockOnDate(
  date: string,
  unixSec: number,
  utcOffsetSeconds: number
): string {
  const wall = new Date((unixSec + utcOffsetSeconds) * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:00${formatUtcOffset(utcOffsetSeconds)}`;
}

interface OwmGeoItem {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface OwmWeatherDesc {
  id: number;
  main: string;
  description: string;
}

interface OwmCurrentResponse {
  coord: { lat: number; lon: number };
  weather: OwmWeatherDesc[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: { speed: number };
  dt: number;
  sys: { sunrise: number; sunset: number; country?: string };
  timezone: number;
  name: string;
}

interface OwmForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: OwmWeatherDesc[];
  wind: { speed: number };
  pop: number;
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
  dt_txt: string;
}

interface OwmForecastResponse {
  list: OwmForecastItem[];
  city: {
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface OwmOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    humidity: number;
    uvi: number;
    wind_speed: number;
    weather: OwmWeatherDesc[];
  };
  hourly: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    pop: number;
    weather: OwmWeatherDesc[];
  }[];
  daily: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: { min: number; max: number };
    feels_like: { day: number };
    humidity: number;
    wind_speed: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
    weather: OwmWeatherDesc[];
  }[];
}

async function owmFetch(url: string): Promise<Response> {
  return fetch(url, { cache: "no-store" });
}

export async function searchOpenWeatherCities(
  query: string
): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    limit: "8",
    appid: getApiKey(),
  });

  const res = await owmFetch(`${OWM_BASE}/geo/1.0/direct?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `OpenWeatherMap search failed (${res.status})${body ? `: ${body}` : ""}`
    );
  }

  const data = (await res.json()) as OwmGeoItem[];
  if (!Array.isArray(data)) return [];

  return data.map((r, i) => ({
    id: i + 1,
    name: r.name,
    latitude: r.lat,
    longitude: r.lon,
    country: r.country,
    admin1: r.state,
    timezone: "auto",
  }));
}

function mapOneCall(
  data: OwmOneCallResponse,
  unit: TemperatureUnit
): ForecastData {
  const offset = data.timezone_offset;
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

  for (const day of data.daily) {
    const date = dateStringFromUnix(day.dt, offset);
    dates.push(date);
    weatherCodes.push(day.weather[0]?.id ?? 800);
    tempMax.push(day.temp.max);
    tempMin.push(day.temp.min);
    feelsLikeMax.push(day.feels_like.day);
    precipProbability.push(Math.round((day.pop ?? 0) * 100));
    const liquid = (day.rain ?? 0) + (day.snow ?? 0);
    precipSum.push(precipAmount(liquid, unit));
    windSpeedMax.push(windSpeed(day.wind_speed, unit));
    uvIndexMax.push(day.uvi ?? 0);
    sunrise.push(toOffsetIsoFromUnix(day.sunrise, offset));
    sunset.push(toOffsetIsoFromUnix(day.sunset, offset));
  }

  return {
    latitude: data.lat,
    longitude: data.lon,
    timezone: data.timezone,
    utcOffsetSeconds: offset,
    current: {
      temperature: data.current.temp,
      feelsLike: data.current.feels_like,
      humidity: data.current.humidity,
      weatherCode: data.current.weather[0]?.id ?? 800,
      windSpeed: windSpeed(data.current.wind_speed, unit),
      time: toOffsetIsoFromUnix(data.current.dt, offset),
    },
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
      times: data.hourly.map((h) => toOffsetIsoFromUnix(h.dt, offset)),
      temperatures: data.hourly.map((h) => h.temp),
      feelsLike: data.hourly.map((h) => h.feels_like),
      humidity: data.hourly.map((h) => h.humidity),
      precipProbability: data.hourly.map((h) =>
        Math.round((h.pop ?? 0) * 100)
      ),
      weatherCodes: data.hourly.map((h) => h.weather[0]?.id ?? 800),
      windSpeed: data.hourly.map((h) => windSpeed(h.wind_speed, unit)),
    },
  };
}

function mapForecast25(
  current: OwmCurrentResponse,
  forecast: OwmForecastResponse,
  unit: TemperatureUnit
): ForecastData {
  const offset = forecast.city.timezone;
  const tzName = offsetToEtcGmt(offset);

  type DayAcc = {
    date: string;
    codes: number[];
    tempMax: number;
    tempMin: number;
    feelsMax: number;
    popMax: number;
    precip: number;
    windMax: number;
  };

  const byDate = new Map<string, DayAcc>();
  const hourlyTimes: string[] = [];
  const hourlyTemps: number[] = [];
  const hourlyFeels: number[] = [];
  const hourlyHumidity: number[] = [];
  const hourlyPrecip: number[] = [];
  const hourlyCodes: number[] = [];
  const hourlyWind: number[] = [];

  for (const item of forecast.list) {
    const date = dateStringFromUnix(item.dt, offset);
    const code = item.weather[0]?.id ?? 800;
    const precipMm = (item.rain?.["3h"] ?? 0) + (item.snow?.["3h"] ?? 0);
    const wind = windSpeed(item.wind.speed, unit);

    const existing = byDate.get(date);
    if (!existing) {
      byDate.set(date, {
        date,
        codes: [code],
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        feelsMax: item.main.feels_like,
        popMax: item.pop ?? 0,
        precip: precipMm,
        windMax: wind,
      });
    } else {
      existing.codes.push(code);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      existing.feelsMax = Math.max(existing.feelsMax, item.main.feels_like);
      existing.popMax = Math.max(existing.popMax, item.pop ?? 0);
      existing.precip += precipMm;
      existing.windMax = Math.max(existing.windMax, wind);
    }

    hourlyTimes.push(toOffsetIsoFromUnix(item.dt, offset));
    hourlyTemps.push(item.main.temp);
    hourlyFeels.push(item.main.feels_like);
    hourlyHumidity.push(item.main.humidity);
    hourlyPrecip.push(Math.round((item.pop ?? 0) * 100));
    hourlyCodes.push(code);
    hourlyWind.push(wind);
  }

  const days = [...byDate.values()];
  const middayCode = (codes: number[]) =>
    codes[Math.floor(codes.length / 2)] ?? 800;

  return {
    latitude: forecast.city.coord.lat,
    longitude: forecast.city.coord.lon,
    timezone: tzName,
    utcOffsetSeconds: offset,
    current: {
      temperature: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      weatherCode: current.weather[0]?.id ?? 800,
      windSpeed: windSpeed(current.wind.speed, unit),
      time: toOffsetIsoFromUnix(current.dt, offset),
    },
    daily: {
      dates: days.map((d) => d.date),
      weatherCodes: days.map((d) => middayCode(d.codes)),
      tempMax: days.map((d) => d.tempMax),
      tempMin: days.map((d) => d.tempMin),
      feelsLikeMax: days.map((d) => d.feelsMax),
      precipProbability: days.map((d) => Math.round(d.popMax * 100)),
      precipSum: days.map((d) => precipAmount(d.precip, unit)),
      windSpeedMax: days.map((d) => d.windMax),
      uvIndexMax: days.map(() => 0),
      sunrise: days.map((d) =>
        wallClockOnDate(d.date, forecast.city.sunrise, offset)
      ),
      sunset: days.map((d) =>
        wallClockOnDate(d.date, forecast.city.sunset, offset)
      ),
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

/** IANA-ish fixed offset label for Intl formatting when we only have seconds. */
function offsetToEtcGmt(utcOffsetSeconds: number): string {
  // Etc/GMT signs are inverted: Etc/GMT+5 means UTC-5
  const hours = Math.round(utcOffsetSeconds / 3600);
  if (hours === 0) return "Etc/UTC";
  return hours > 0 ? `Etc/GMT-${hours}` : `Etc/GMT+${Math.abs(hours)}`;
}

export async function fetchOpenWeatherForecast(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = "celsius"
): Promise<ForecastData> {
  const key = getApiKey();
  const units = owmUnits(unit);

  // Prefer One Call 3.0 when the key has that subscription.
  const oneCallParams = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    units,
    exclude: "minutely,alerts",
    appid: key,
  });
  const oneCallRes = await owmFetch(
    `${OWM_BASE}/data/3.0/onecall?${oneCallParams}`
  );
  if (oneCallRes.ok) {
    const data = (await oneCallRes.json()) as OwmOneCallResponse;
    return mapOneCall(data, unit);
  }

  // Free-tier fallback: current + 5-day / 3-hour forecast.
  const common = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    units,
    appid: key,
  });

  const [currentRes, forecastRes] = await Promise.all([
    owmFetch(`${OWM_BASE}/data/2.5/weather?${common}`),
    owmFetch(`${OWM_BASE}/data/2.5/forecast?${common}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    const failed = !currentRes.ok ? currentRes : forecastRes;
    const body = await failed.text();
    if (failed.status === 401) {
      throw new Error(
        "OpenWeatherMap API key is invalid or not activated yet (new keys can take up to 2 hours). One Call 3.0 also needs a separate subscription if you want 8-day hourly data."
      );
    }
    throw new Error(
      `OpenWeatherMap forecast failed (${failed.status})${body ? `: ${body}` : ""}`
    );
  }

  const current = (await currentRes.json()) as OwmCurrentResponse;
  const forecast = (await forecastRes.json()) as OwmForecastResponse;
  return mapForecast25(current, forecast, unit);
}
