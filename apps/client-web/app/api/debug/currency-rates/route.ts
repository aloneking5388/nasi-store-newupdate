import { NextResponse } from "next/server";
import { getCurrencyRatesDebugInfo } from "@/lib/currencyRates";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getCurrencyRatesDebugInfo();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to get currency rates debug info",
      },
      { status: 500 },
    );
  }
}
