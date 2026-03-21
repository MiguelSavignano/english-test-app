import { Client, LocalAuth } from "whatsapp-web.js";

// Singleton pattern — survives Next.js hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __wasapClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __wasapQR: string | undefined;
  // eslint-disable-next-line no-var
  var __wasapReady: boolean;
}

function createClient(): Client {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: ".wasap-session" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr: string) => {
    global.__wasapQR = qr;
    global.__wasapReady = false;
    console.log("[wasap] QR received, scan it at /wasap");
  });

  client.on("ready", () => {
    global.__wasapReady = true;
    global.__wasapQR = undefined;
    console.log("[wasap] Client ready");
  });

  client.on("disconnected", () => {
    global.__wasapReady = false;
    global.__wasapClient = undefined;
    console.log("[wasap] Client disconnected");
  });

  client.initialize();
  return client;
}

export function getWasapClient(): Client {
  if (!global.__wasapClient) {
    global.__wasapClient = createClient();
    global.__wasapReady = false;
  }
  return global.__wasapClient;
}

export function getWasapStatus() {
  return {
    ready: global.__wasapReady ?? false,
    qr: global.__wasapQR ?? null,
  };
}

export async function sendWhatsApp(text: string): Promise<void> {
  const client = getWasapClient();
  if (!global.__wasapReady) {
    throw new Error("WhatsApp client is not ready — scan the QR code first");
  }

  const phone = process.env.WASAP_PHONE;
  if (!phone) throw new Error("Missing WASAP_PHONE environment variable");

  // WhatsApp chat ID format: international number without + suffix @c.us
  const chatId = phone.replace(/\D/g, "") + "@c.us";
  await client.sendMessage(chatId, text);
}
