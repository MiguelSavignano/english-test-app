import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/wasap";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = body?.message ?? "Hello World from english-test-app! 👋";

  try {
    await sendWhatsApp(message);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
