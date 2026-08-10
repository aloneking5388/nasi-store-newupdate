import { getHomeData } from "@/lib/homeData";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 120;

export async function GET(req: NextRequest) {
  try {
    const data = await getHomeData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("Home API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
