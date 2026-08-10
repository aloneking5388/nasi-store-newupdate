import { NextRequest, NextResponse } from "next/server";
import { sendRegisterSuccessEmail } from "@/lib/registerHelper";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    await sendRegisterSuccessEmail(email, name);

    return NextResponse.json(
      { success: true, outcome: "EMAIL_SENT_OR_SKIPPED" },
      { status: 200 },
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, outcome: "EMAIL_FAILED", details },
      { status: 500 },
    );
  }
}
