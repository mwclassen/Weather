import { NextResponse } from "next/server";
import { searchCitiesWithProvider } from "@/lib/weather-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const results = await searchCitiesWithProvider(q);
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "City search failed";
    const status =
      message.includes("KEY") || message.includes("configured") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
