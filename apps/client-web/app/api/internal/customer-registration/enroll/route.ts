import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { applySubscriptionEnrollment } from "@/utils/subscriptionEnrollment";
import { validateSubscriptionEntry } from "@nasi/validation/subscription";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { userId, referredBy, joiningFee } = await req.json();
    const normalizedReferral = referredBy?.trim() || "";

    if (!normalizedReferral) {
      return NextResponse.json({ success: true, outcome: "NO_OP" }, { status: 200 });
    }

    const parsedJoiningFee = Number(joiningFee || 0);
    const referrer = await validateSubscriptionEntry(normalizedReferral, parsedJoiningFee);
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found for enrollment");
    }

    await applySubscriptionEnrollment(user, referrer);

    return NextResponse.json({ success: true, outcome: "ENROLLED" }, { status: 200 });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, outcome: "DOMAIN_REJECTED", details },
      { status: 500 },
    );
  }
}
