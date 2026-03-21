import { createMessage } from "@/lib/ollama";
import { fetchREEPrices } from "@/lib/ree";

export interface HourPrice {
  hour: number;
  price: number; // EUR/kWh
  datetime: string;
}

export interface ElectricResult {
  currentPrice: number;
  currentHour: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  cheapestHour: number;
  mostExpensiveHour: number;
  hours: HourPrice[];
  priceLevel: "cheap" | "normal" | "expensive";
  funnyMessage: string;
  updatedAt: string;
}

const funnySystemContext = `
You are a dramatically over-the-top Spanish household economist with a sharp sense of humor.
Given electricity price data in Spain (PVPC tariff), write a SHORT and FUNNY message (1-2 sentences max).
Be sarcastic, dramatic, or absurd. Reference everyday Spanish life: washing machines, air conditioning,
the sufrimiento of the electricity bill, and the eternal struggle of the Spanish middle class.
Write in Spanish. Keep it punchy and entertaining. No lists, just a fun paragraph.
`;

export async function fetchFunnyElectric(): Promise<ElectricResult> {
  const now = new Date();

  console.log("[fetchFunnyElectric] Starting — current time:", now.toISOString());

  const included = await fetchREEPrices(now);

  const pvpc = included.find((i) => i.attributes.title === "PVPC");
  if (!pvpc) throw new Error("PVPC indicator not found in REE response");

  const hours: HourPrice[] = pvpc.attributes.values.map((v) => ({
    hour: new Date(v.datetime).getHours(),
    price: v.value / 1000, // EUR/MWh -> EUR/kWh
    datetime: v.datetime,
  }));

  const currentHour = now.getHours();
  const currentEntry = hours.find((h) => h.hour === currentHour) ?? hours[0];
  const prices = hours.map((h) => h.price);

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const cheapestHour = hours.find((h) => h.price === minPrice)!.hour;
  const mostExpensiveHour = hours.find((h) => h.price === maxPrice)!.hour;

  const currentPrice = currentEntry.price;
  const priceLevel: ElectricResult["priceLevel"] =
    currentPrice <= avgPrice * 0.85
      ? "cheap"
      : currentPrice >= avgPrice * 1.15
      ? "expensive"
      : "normal";

  console.log("[fetchFunnyElectric] Computed stats — currentPrice:", currentPrice, "avg:", avgPrice, "level:", priceLevel);

  const summary = `
Precio de la electricidad en Espana hoy (tarifa PVPC):
- Hora actual: ${currentHour}:00h
- Precio ahora: ${(currentPrice * 100).toFixed(3)} cEUR/kWh
- Precio medio hoy: ${(avgPrice * 100).toFixed(3)} cEUR/kWh
- Precio minimo hoy: ${(minPrice * 100).toFixed(3)} cEUR/kWh a las ${cheapestHour}:00h
- Precio maximo hoy: ${(maxPrice * 100).toFixed(3)} cEUR/kWh a las ${mostExpensiveHour}:00h
- Nivel actual: ${priceLevel === "cheap" ? "barato" : priceLevel === "expensive" ? "caro" : "normal"}
  `.trim();

  console.log("[fetchFunnyElectric] Sending summary to Ollama:", summary);

  let funnyMessage =
    "La inteligencia artificial encargada del parte electrico esta en huelga. Apaga el aire acondicionado por precaucion.";
  try {
    funnyMessage = await createMessage(summary, funnySystemContext);
    console.log("[fetchFunnyElectric] Ollama response:", funnyMessage);
  } catch (error) {
    console.warn("[fetchFunnyElectric] Ollama unavailable, using fallback:", error);
  }

  return {
    currentPrice,
    currentHour,
    avgPrice,
    minPrice,
    maxPrice,
    cheapestHour,
    mostExpensiveHour,
    hours,
    priceLevel,
    funnyMessage,
    updatedAt: now.toISOString(),
  };
}
