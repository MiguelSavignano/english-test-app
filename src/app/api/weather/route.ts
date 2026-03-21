import { createMessage } from "@/lib/ollama";
import { NextResponse } from "next/server";

const WMO_CODES: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "icy fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  71: "light snow",
  73: "moderate snow",
  75: "heavy snow",
  80: "rain showers",
  81: "moderate showers",
  82: "violent showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with heavy hail",
};

const funnySystemContext = `
You are a dramatically over-the-top weather commentator with a sharp sense of humor.
Given weather data for Alcalá de Henares, Spain, write a SHORT and FUNNY message (3-5 sentences max)
about the current weather. Be sarcastic, dramatic, or absurd. You can reference local culture,
Don Quixote (the city is near where Cervantes was born), or everyday Spanish life.
Write in English. Keep it punchy and entertaining. No lists, just a fun paragraph.
`;

export async function GET() {
  try {
    const weatherRes = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.4818&longitude=-3.3607&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=Europe%2FMadrid",
      { next: { revalidate: 1800 } }
    );

    if (!weatherRes.ok) throw new Error("Weather fetch failed");

    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const weatherDescription =
      WMO_CODES[current.weather_code as number] ?? "mysterious conditions";

    const weatherSummary = `
Current weather in Alcalá de Henares, Spain:
- Condition: ${weatherDescription}
- Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
- Humidity: ${current.relative_humidity_2m}%
- Wind speed: ${current.wind_speed_10m} km/h
- Precipitation: ${current.precipitation} mm
    `.trim();

    let funnyMessage = "The AI weather oracle is taking a siesta right now. Try again later, amigo! 🌞";
    try {
      funnyMessage = await createMessage(weatherSummary, funnySystemContext);
    } catch {
      console.warn("Ollama unavailable, using fallback funny message");
    }

    return NextResponse.json({
      weather: {
        description: weatherDescription,
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
        time: current.time,
      },
      funnyMessage,
    });
  } catch (error) {
    console.error("Weather route error:", error);
    return NextResponse.json({ error: "Could not fetch weather data" }, { status: 500 });
  }
}
