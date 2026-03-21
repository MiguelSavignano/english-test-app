import { createMessage } from "@/lib/ollama";

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

export const CITIES: Record<string, { label: string; lat: number; lon: number; fun: string }> = {
  alcala: {
    label: "Alcalá de Henares",
    lat: 40.4818,
    lon: -3.3607,
    fun: "You can reference Don Quixote or Cervantes (the city is his birthplace) and the rich university history.",
  },
  oviedo: {
    label: "Oviedo",
    lat: 43.3614,
    lon: -5.8593,
    fun: "You can reference the constant rain, sidra (cider), fabada asturiana, and the proud Asturian culture.",
  },
  getafe: {
    label: "Getafe",
    lat: 40.3058,
    lon: -3.7328,
    fun: "You can reference the industrial suburbs of Madrid, Getafe CF football club, and the chaos of commuting to Madrid.",
  },
};

const funnySystemContext = (cityLabel: string, cityFun: string) => `
You are a dramatically over-the-top weather commentator with a sharp sense of humor.
Given weather data for ${cityLabel}, Spain, write a SHORT and FUNNY message (3-5 sentences max)
about the current weather. Be sarcastic, dramatic, or absurd. ${cityFun}
Write in Spanish. Keep it punchy and entertaining. No lists, just a fun paragraph.
`;

export interface WeatherResult {
  city: string;
  weather: {
    description: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
    time: string;
  };
  funnyMessage: string;
}

export async function fetchFunnyWeather(cityKey: string): Promise<WeatherResult> {
  const city = CITIES[cityKey] ?? CITIES.alcala;

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=Europe%2FMadrid`,
    { next: { revalidate: 1800 } }
  );

  if (!weatherRes.ok) throw new Error("Weather fetch failed");

  const weatherData = await weatherRes.json();
  const current = weatherData.current;

  const weatherDescription = WMO_CODES[current.weather_code as number] ?? "mysterious conditions";

  const weatherSummary = `
Current weather in ${city.label}, Spain:
- Condition: ${weatherDescription}
- Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
- Humidity: ${current.relative_humidity_2m}%
- Wind speed: ${current.wind_speed_10m} km/h
- Precipitation: ${current.precipitation} mm
  `.trim();

  let funnyMessage = "El oráculo del tiempo está de siesta ahora mismo. ¡Inténtalo más tarde, amigo! 🌞";
  try {
    funnyMessage = await createMessage(weatherSummary, funnySystemContext(city.label, city.fun));
  } catch {
    console.warn("Ollama unavailable, using fallback funny message");
  }

  return {
    city: city.label,
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
  };
}
