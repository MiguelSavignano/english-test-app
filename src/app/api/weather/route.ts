import { fetchFunnyWeather } from "@/lib/fetchFunnyWeather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cityKey = req.nextUrl.searchParams.get("city") ?? "alcala";

  try {
    const result = await fetchFunnyWeather(cityKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Weather route error:", error);
    return NextResponse.json({ error: "Could not fetch weather data" }, { status: 500 });
  }
}
