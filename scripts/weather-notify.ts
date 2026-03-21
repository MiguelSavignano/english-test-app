/**
 * Standalone scheduler: sends a weather + AI funny message to WhatsApp on a cron schedule.
 * Requires an existing WhatsApp session — connect first via /wasap in the app.
 *
 * Usage:  npm run notify
 *
 * Schedule is read from WASAP_CRON in .env. Multiple expressions separated by comma.
 * Examples:
 *   WASAP_CRON="30 9 * * *"           → every day at 09:30
 *   WASAP_CRON="30 9 * * *,0 18 * * *" → every day at 09:30 and 18:00
 */

import * as dotenv from "dotenv";
dotenv.config();

import { existsSync, rmSync } from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";
import cron from "node-cron";

const SESSION_PATH = ".wasap-session";
// Puppeteer leaves a lock file when the process exits uncleanly (e.g. Ctrl+C, crash).
// Remove it so we can start a fresh browser instance.
const LOCK_FILE = `${SESSION_PATH}/session/SingletonLock`;
if (existsSync(LOCK_FILE)) {
  rmSync(LOCK_FILE);
  console.log("[notify] Removed stale SingletonLock");
}
const CITY = process.env.WASAP_CITY ?? "alcala";
const PHONE = process.env.WASAP_PHONE;
const CRON_EXPRESSIONS = (process.env.WASAP_CRON ?? "30 9 * * *").split(",").map((s) => s.trim());

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

const invalidExpressions = CRON_EXPRESSIONS.filter((expr) => !cron.validate(expr));
if (invalidExpressions.length > 0) {
  console.error(`[notify] Invalid cron expression(s): ${invalidExpressions.join(", ")}`);
  process.exit(1);
}

// --- Core ---

async function sendWeatherUpdate(client: Client) {
  // Dynamic import ensures ollama.ts reads process.env AFTER dotenv.config() has run
  const { fetchFunnyWeather } = await import("@/lib/fetchFunnyWeather");
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

client.on("ready", () => {
  console.log(`[notify] Client ready. Scheduling for: ${CRON_EXPRESSIONS.join(" | ")}`);

  for (const expr of CRON_EXPRESSIONS) {
    cron.schedule(expr, () => {
      sendWeatherUpdate(client).catch(console.error);
    });
  }
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
