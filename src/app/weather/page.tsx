"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  description: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  time: string;
}

interface WeatherResponse {
  weather: WeatherData;
  funnyMessage: string;
  error?: string;
}

const WEATHER_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

export default function WeatherPage() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchWeather() {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/weather");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ weather: {} as WeatherData, funnyMessage: "", error: "Failed to load weather." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather();
  }, []);

  const emoji = data?.weather?.weatherCode != null
    ? (WEATHER_EMOJI[data.weather.weatherCode] ?? "🌡️")
    : "🌡️";

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-1">
          Weather in Alcalá de Henares
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
          Birthplace of Cervantes — land of windmills and questionable weather
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Consulting the AI oracle about this city's weather drama...
            </p>
          </div>
        )}

        {!loading && data?.error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center text-red-600 dark:text-red-400">
            {data.error}
          </div>
        )}

        {!loading && data?.weather && !data.error && (
          <div className="space-y-4">
            {/* Main weather card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 text-center">
              <div className="text-8xl mb-2">{emoji}</div>
              <div className="text-6xl font-bold text-slate-800 dark:text-white mb-1">
                {Math.round(data.weather.temperature)}°C
              </div>
              <div className="text-slate-500 dark:text-slate-400 capitalize text-lg">
                {data.weather.description}
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Feels like {Math.round(data.weather.feelsLike)}°C
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="💧" label="Humidity" value={`${data.weather.humidity}%`} />
              <StatCard icon="💨" label="Wind" value={`${Math.round(data.weather.windSpeed)} km/h`} />
              <StatCard icon="🌧️" label="Precip." value={`${data.weather.precipitation} mm`} />
            </div>

            {/* AI funny message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-5">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">
                🤖 AI Weather Commentary
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {data.funnyMessage}
              </p>
            </div>

            {/* Last updated + refresh */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-1">
              <span>
                Updated: {new Date(data.weather.time).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                onClick={fetchWeather}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Refresh ↻
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-slate-800 dark:text-white font-semibold text-sm">{value}</div>
      <div className="text-slate-400 dark:text-slate-500 text-xs">{label}</div>
    </div>
  );
}
