/**
 * Standalone scheduler: sends a weather + AI funny message to WhatsApp every 5 minutes.
 * Requires an existing WhatsApp session — connect first via /wasap in the app.
 *
 * Usage:  npm run notify
 */

import * as dotenv from "dotenv";
dotenv.config();

import { existsSync } from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";
import { fetchFunnyWeather } from "@/lib/fetchFunnyWeather";

const SESSION_PATH = ".wasap-session";
const CITY = process.env.WASAP_CITY ?? "Madrid";
const PHONE = process.env.WASAP_PHONE;
const INTERVAL_MS = 5 * 60 * 1000;

const WEATHER_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

// --- Guards ---

if (!existsSync(SESSION_PATH)) {
  console.error(`[notify] No session found at '${SESSION_PATH}'.`);
  console.error("[notify] Start the app, visit /wasap, and scan the QR code first.");
  process.exit(1);
}

if (!PHONE) {
  console.error("[notify] WASAP_PHONE is not set in .env");
  process.exit(1);
}

// --- Core ---

console.log(process.env.OLLAMA_API_URL);

async function sendWeatherUpdate(client: Client) {
  console.log(`[notify] Fetching weather for ${CITY}...`);
  const data = await fetchFunnyWeather(CITY);
  const emoji = WEATHER_EMOJI[data.weather.weatherCode] ?? "🌡️";
  const text =
    `${emoji} *Weather in ${data.city}*\n` +
    `🌡️ ${Math.round(data.weather.temperature)}°C (feels like ${Math.round(data.weather.feelsLike)}°C)\n` +
    `💧 Humidity: ${data.weather.humidity}%  💨 Wind: ${Math.round(data.weather.windSpeed)} km/h\n\n` +
    `🤖 ${data.funnyMessage}`;

  const chatId = PHONE!.replace(/\D/g, "") + "@c.us";
  await client.sendMessage(chatId, text);
  console.log(`[notify] Sent at ${new Date().toLocaleTimeString()} → ${data.city}`);
}

// --- WhatsApp client ---

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("ready", async () => {
  console.log(`[notify] Client ready. Sending every ${INTERVAL_MS / 60000} min to ${PHONE}`);

  // Fire immediately, then on interval
  await sendWeatherUpdate(client).catch(console.error);
  setInterval(() => sendWeatherUpdate(client).catch(console.error), INTERVAL_MS);
});

client.on("auth_failure", () => {
  console.error("[notify] Auth failed — session expired. Re-connect via /wasap.");
  process.exit(1);
});

client.on("disconnected", () => {
  console.error("[notify] Disconnected. Exiting.");
  process.exit(1);
});

console.log("[notify] Initializing WhatsApp client...");
client.initialize();
