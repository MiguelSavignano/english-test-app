import { NextResponse } from "next/server";
import { getWasapClient, getWasapStatus } from "@/lib/wasap";
import qrcode from "qrcode";

export async function GET() {
  // Ensure the client is initialized
  getWasapClient();

  const { ready, qr } = getWasapStatus();

  let qrDataUrl: string | null = null;
  if (qr) {
    qrDataUrl = await qrcode.toDataURL(qr);
  }

  return NextResponse.json({ ready, qrDataUrl });
}
