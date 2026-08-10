import { sendNewsletterToAudience } from "@/lib/newsletterHelper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sendNewsletterToAudience();
    return NextResponse.json({ success: true, message: "Newsletter sent successfully." });
  } catch (error) {
    console.error("Newsletter sending failed:", error);
    return NextResponse.json({ success: false, error: "Failed to send newsletter." }, { status: 500 });
  }
}
