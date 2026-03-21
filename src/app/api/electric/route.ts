import { fetchFunnyElectric } from "@/lib/fetchFunnyElectric";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await fetchFunnyElectric();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Electric route error:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el precio de la luz" },
      { status: 500 }
    );
  }
}
