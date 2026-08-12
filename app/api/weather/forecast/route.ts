import { NextResponse } from "next/server";
import { fetchForecastWithProvider } from "@/lib/weather-provider";
import type { TemperatureUnit } from "@/lib/open-meteo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const unitParam = searchParams.get("unit");
  const unit: TemperatureUnit =
    unitParam === "fahrenheit" ? "fahrenheit" : "celsius";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 }
    );
  }

  try {
    const forecast = await fetchForecastWithProvider(lat, lon, unit);
    return NextResponse.json(forecast);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Forecast fetch failed";
    const status =
      message.includes("KEY") || message.includes("configured") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
