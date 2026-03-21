export interface REEPriceValue {
  value: number; // EUR/MWh
  percentage: number;
  datetime: string;
}

export interface REEIncluded {
  type: string;
  id: string;
  attributes: {
    title: string;
    "last-update": string;
    unity: string;
    temporality: string;
    values: REEPriceValue[];
  };
}

export interface REEResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      title: string;
      "last-update": string;
    };
  };
  included: REEIncluded[];
}

export async function fetchREEPrices(date: Date): Promise<REEIncluded[]> {
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 0, 0);

  const url = new URL(
    "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real"
  );
  url.searchParams.set("start_date", fmt(start));
  url.searchParams.set("end_date", fmt(end));
  url.searchParams.set("time_trunc", "hour");

  console.log("[REE] Calling API:", url.toString());

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  console.log("[REE] Response status:", res.status, res.statusText);

  if (!res.ok) {
    console.error("[REE] Request failed:", res.status, res.statusText);
    throw new Error(`REE API failed: ${res.status}`);
  }

  const data: REEResponse = await res.json();

  console.log("[REE] Included indicators:", data.included?.map((i) => i.attributes.title));
  console.log("[REE] Last update:", data.data?.attributes?.["last-update"]);

  const pvpc = data.included?.find((i) => i.attributes.title === "PVPC");
  if (pvpc) {
    console.log(
      "[REE] PVPC values received:",
      pvpc.attributes.values.length,
      "hours —",
      pvpc.attributes.values.map((v) => `${new Date(v.datetime).getHours()}h:${v.value}€/MWh`)
    );
  } else {
    console.warn("[REE] PVPC indicator not found in response");
  }

  return data.included ?? [];
}
