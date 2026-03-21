import citiesData from "@/data/cities.json";

export interface CityConfig {
  label: string;
  lat: number;
  lon: number;
  fun: string;
}

export const CITIES: Record<string, CityConfig> = citiesData as Record<string, CityConfig>;

export const WMO_CODES: Record<number, string> = {
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

export interface CurrentWeather {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
  time: string;
}

export interface WeatherData {
  city: CityConfig;
  current: CurrentWeather;
  description: string;
}

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

export async function fetchWeatherForCity(cityKey: string): Promise<WeatherData> {
  const city = CITIES[cityKey] ?? CITIES.alcala;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(city.lat));
  url.searchParams.set("longitude", String(city.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code"
  );
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("timezone", "Europe/Madrid");

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);

  const data: { current: CurrentWeather } = await res.json();
  const description = WMO_CODES[data.current.weather_code] ?? "mysterious conditions";

  return { city, current: data.current, description };
}
