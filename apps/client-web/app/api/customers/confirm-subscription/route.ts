import { verifyToken } from "@/lib/auth";
import { getAccessToken, checkPaymentStatus } from "@/lib/momo";
import PendingSubscription from "@/models/PendingSubscription";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { applySubscriptionEnrollment } from "@/utils/subscriptionEnrollment";
import { resolveCustomerType } from "@/utils/customerType";
import jwt from "jsonwebtoken";
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

    const { momoReferenceId } = await req.json();
    if (!momoReferenceId)
      return NextResponse.json(
        { message: "Reference ID required" },
        { status: 400 },
      );

    const pending = await PendingSubscription.findOne({
      momoReferenceId,
      customerId: userId,
    });

    if (!pending)
      return NextResponse.json(
        { message: "Payment record not found" },
        { status: 404 },
      );

    if (pending.status === "paid")
      return NextResponse.json(
        { message: "Already activated" },
        { status: 400 },
      );

    if (pending.status === "failed" || pending.expiresAt < new Date())
      return NextResponse.json(
        { message: "Payment expired or failed. Please try again." },
        { status: 400 },
      );

    const momoToken = await getAccessToken();
    const { status: momoStatus } = await checkPaymentStatus(
      momoReferenceId,
      momoToken,
    );

    if (momoStatus === "PENDING") {
      return NextResponse.json(
        {
          message:
            "Payment still pending. Please approve on your phone then try again.",
        },
        { status: 202 },
      );
    }

    if (momoStatus === "FAILED") {
      pending.status = "failed";
      await pending.save();
      return NextResponse.json(
        { message: "Payment failed. Please try again." },
        { status: 400 },
      );
    }

    // SUCCESSFUL — activate subscription using existing MLM logic
    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const referrer = await User.findOne({ referralCode: pending.referralCode });
    if (!referrer)
      return NextResponse.json(
        { message: "Referral code no longer valid" },
        { status: 400 },
      );

    await applySubscriptionEnrollment(user, referrer);

    pending.status = "paid";
    await pending.save();

    const customerType = resolveCustomerType(user);
    const nextToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        customerType,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json({
      success: true,
      message: "Subscription activated successfully!",
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        customerType,
        referralCode: user.referralCode,
      },
      token: nextToken,
    });

    response.cookies.set("token", nextToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
