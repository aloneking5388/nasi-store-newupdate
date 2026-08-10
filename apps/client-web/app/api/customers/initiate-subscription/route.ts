import { verifyToken } from "@/lib/auth";
import { getAccessToken, requestToPay } from "@/lib/momo";
import PendingSubscription from "@/models/PendingSubscription";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { resolveCustomerType } from "@/utils/customerType";
import { validateSubscriptionEntry } from "@nasi/validation/subscription";
import { SUBSCRIPTION_JOINING_FEE } from "@nasi/constants/subscription";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    const userId = decoded?.id;
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { referralCode, phone } = await req.json();
    if (!phone?.trim())
      return NextResponse.json(
        { message: "Phone number is required for MoMo payment" },
        { status: 400 },
      );

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (resolveCustomerType(user) === "subscription")
      return NextResponse.json(
        { message: "You already have a subscription" },
        { status: 400 },
      );

    // Validates referral code and fee, throws on invalid
    const referrer = await validateSubscriptionEntry(
      referralCode,
      SUBSCRIPTION_JOINING_FEE,
    );

    if (String(referrer._id) === String(user._id))
      return NextResponse.json(
        { message: "You cannot use your own referral code" },
        { status: 400 },
      );

    const externalId = uuidv4();
    const momoToken = await getAccessToken();

    const { uuid: momoReferenceId } = await requestToPay({
      amount: String(SUBSCRIPTION_JOINING_FEE),
      externalId,
      phone: phone.trim(),
      token: momoToken,
    });

    await PendingSubscription.create({
      customerId: user._id,
      referralCode: referralCode.trim(),
      momoReferenceId,
      phone: phone.trim(),
      amount: SUBSCRIPTION_JOINING_FEE,
      status: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    return NextResponse.json({
      success: true,
      message: `Payment of UGX ${SUBSCRIPTION_JOINING_FEE} requested. Approve on your phone then click Confirm.`,
      momoReferenceId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
