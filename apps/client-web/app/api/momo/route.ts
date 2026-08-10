// app/api/momo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requestToPay } from "@/lib/momo";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { amount, phone, externalId } = await req.json();

    if (!amount || !phone || !externalId) {
      return NextResponse.json(
        {
          success: false,
          message: "amount, phone and externalId are required",
        },
        { status: 400 },
      );
    }

    const token = await getAccessToken();
    const result = await requestToPay({ amount, phone, externalId, token });

    return NextResponse.json(
      { success: true, referenceId: result.uuid },
      { status: 200 },
    );
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const upstreamData = error.response?.data;
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          upstreamStatus: status,
          upstreamData,
        },
        { status },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
