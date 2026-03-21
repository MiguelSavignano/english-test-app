"use client";

import { useEffect, useState, useCallback } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function WasapPage() {
  const [ready, setReady] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("Hello World from english-test-app! 👋");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/wasap/status");
      const data = await res.json();
      setReady(data.ready);
      setQrDataUrl(data.qrDataUrl ?? null);
    } catch {
      // ignore transient errors
    }
  }, []);

  // Poll every 3 seconds until ready
  useEffect(() => {
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  async function sendMessage() {
    setStatus("sending");
    setFeedback("");
    try {
      const res = await fetch("/api/wasap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setFeedback("Message sent!");
      } else {
        setStatus("error");
        setFeedback(data.error ?? "Failed to send.");
      }
    } catch {
      setStatus("error");
      setFeedback("Network error.");
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
            WhatsApp Bot
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Powered by whatsapp-web.js
          </p>
        </div>

        {/* Status indicator */}
        <div className={`rounded-2xl px-5 py-3 text-sm font-medium text-center ${
          ready
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
        }`}>
          {ready ? "✓ Connected — client is ready" : "⏳ Waiting for WhatsApp connection..."}
        </div>

        {/* QR code panel */}
        {!ready && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
              Scan this QR code with WhatsApp on your phone.<br />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Phone → Linked Devices → Link a Device
              </span>
            </p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-56 h-56 rounded-xl" />
            ) : (
              <div className="w-56 h-56 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              QR refreshes every 3 seconds
            </p>
          </div>
        )}

        {/* Send form — only when ready */}
        {ready && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={status === "sending" || !message.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
            >
              {status === "sending" ? "Sending..." : "Send to WhatsApp"}
            </button>

            {status === "success" && (
              <p className="text-center text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ {feedback}
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium">
                ✗ {feedback}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
