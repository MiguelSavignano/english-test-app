import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const reply = await createMessage(message);
  return NextResponse.json({ reply });
}
