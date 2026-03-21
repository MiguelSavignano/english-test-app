"use client";

import { useEffect, useState } from "react";
import type { ElectricResult, HourPrice } from "@/lib/fetchFunnyElectric";

interface ApiResponse extends ElectricResult {
  error?: string;
}

const LEVEL_CONFIG = {
  cheap: {
    bg: "from-green-50 to-emerald-100 dark:from-slate-900 dark:to-emerald-950",
    card: "bg-green-500",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/50",
    label: "Barato",
    emoji: "🟢",
  },
  normal: {
    bg: "from-amber-50 to-yellow-100 dark:from-slate-900 dark:to-amber-950",
    card: "bg-amber-500",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50",
    label: "Normal",
    emoji: "🟡",
  },
  expensive: {
    bg: "from-red-50 to-rose-100 dark:from-slate-900 dark:to-rose-950",
    card: "bg-red-500",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/50",
    label: "Caro",
    emoji: "🔴",
  },
};

function fmt(price: number) {
  return (price * 100).toFixed(3);
}

function HourBar({ h, max, current }: { h: HourPrice; max: number; current: number }) {
  const pct = max > 0 ? (h.price / max) * 100 : 0;
  const isNow = h.hour === current;
  const color =
    pct < 40 ? "bg-green-400" : pct < 70 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="flex flex-col items-center gap-0.5" title={`${h.hour}:00h — ${fmt(h.price)} c€/kWh`}>
      <div className="w-full flex flex-col justify-end h-16 relative">
        <div
          className={`w-full rounded-t ${color} ${isNow ? "ring-2 ring-slate-800 dark:ring-white" : ""} transition-all`}
          style={{ height: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <span className={`text-[9px] ${isNow ? "font-bold text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
        {h.hour}
      </span>
    </div>
  );
}

export default function ElectricPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/electric");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ error: "Error al cargar los datos" } as ApiResponse);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const level = data?.priceLevel ?? "normal";
  const cfg = LEVEL_CONFIG[level];

  return (
    <main className={`min-h-screen bg-linear-to-b ${cfg.bg} flex flex-col items-center justify-center p-6`}>
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-1">
          Precio de la Luz
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
          PVPC en tiempo real — ¿es buen momento para poner la lavadora?
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Consultando el oráculo eléctrico...
            </p>
          </div>
        )}

        {!loading && data?.error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center text-red-600 dark:text-red-400">
            {data.error}
          </div>
        )}

        {!loading && data && !data.error && (
          <div className="space-y-4">
            {/* Main price card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 text-center">
              <div className="text-6xl mb-2">⚡</div>
              <div className="text-5xl font-bold text-slate-800 dark:text-white mb-1">
                {fmt(data.currentPrice)}
                <span className="text-2xl font-normal text-slate-400 ml-1">c€/kWh</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                Hora actual: {data.currentHour}:00h
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${cfg.badge}`}>
                {cfg.emoji} {cfg.label} respecto a la media
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📊" label="Media hoy" value={`${fmt(data.avgPrice)} c€`} />
              <StatCard icon="💚" label={`Más barato (${data.cheapestHour}h)`} value={`${fmt(data.minPrice)} c€`} />
              <StatCard icon="🔥" label={`Más caro (${data.mostExpensiveHour}h)`} value={`${fmt(data.maxPrice)} c€`} />
            </div>

            {/* Hourly bar chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Precios por hora hoy
              </p>
              <div className="grid grid-cols-24 gap-0.5" style={{ gridTemplateColumns: `repeat(${data.hours.length}, 1fr)` }}>
                {data.hours.map((h) => (
                  <HourBar key={h.hour} h={h} max={data.maxPrice} current={data.currentHour} />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Barato</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Normal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Caro</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 border-2 border-slate-700 dark:border-white rounded-sm" /> Ahora</span>
              </div>
            </div>

            {/* AI funny message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-5">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">
                🤖 Consejo de la IA
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {data.funnyMessage}
              </p>
            </div>

            {/* Last updated + refresh */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-1">
              <span>
                Actualizado:{" "}
                {new Date(data.updatedAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                onClick={load}
                className="text-amber-500 hover:text-amber-600 dark:text-amber-400 font-medium hover:underline"
              >
                Actualizar ↻
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
      <div className="text-slate-400 dark:text-slate-500 text-xs leading-tight mt-0.5">{label}</div>
    </div>
  );
}
