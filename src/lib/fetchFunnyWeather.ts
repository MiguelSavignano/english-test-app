import { createMessage } from "@/lib/ollama";
import { fetchWeatherForCity } from "@/lib/openMeteo";

export { CITIES } from "@/lib/openMeteo";

const funnySystemContext = (cityLabel: string, cityFun: string) => `
You are a dramatically over-the-top weather commentator with a sharp sense of humor.
Given weather data for ${cityLabel}, Spain, write a SHORT and FUNNY message (1-2 sentences max)
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
  const { city, current, description } = await fetchWeatherForCity(cityKey);

  const weatherSummary = `
Current weather in ${city.label}, Spain:
- Condition: ${description}
- Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
- Humidity: ${current.relative_humidity_2m}%
- Wind speed: ${current.wind_speed_10m} km/h
- Precipitation: ${current.precipitation} mm
  `.trim();

  let funnyMessage = "El oraculo del tiempo esta de siesta ahora mismo. Intentalo mas tarde, amigo!";
  try {
    funnyMessage = await createMessage(weatherSummary, funnySystemContext(city.label, city.fun));
  } catch (error) {
    console.warn("Ollama unavailable, using fallback funny message", error);
  }

  return {
    city: city.label,
    weather: {
      description,
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
