import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import jwt from "jsonwebtoken";
import { resolveCustomerType } from "@/utils/customerType";
import { applySubscriptionEnrollment } from "@/utils/subscriptionEnrollment";
import { validateSubscriptionEntry } from "@nasi/validation/subscription";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { referralCode, joiningFee } = await req.json();
    const parsedJoiningFee = Number(joiningFee || 0);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    if (resolveCustomerType(user) === "subscription") {
      return NextResponse.json(
        { message: "You already joined the subscription program" },
        { status: 400 },
      );
    }

    const referrer = await validateSubscriptionEntry(
      referralCode,
      parsedJoiningFee,
    );

    if (String(referrer._id) === String(user._id)) {
      return NextResponse.json(
        { message: "You cannot use your own referral code" },
        { status: 400 },
      );
    }

    await applySubscriptionEnrollment(user, referrer);

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

    const response = NextResponse.json(
      {
        success: true,
        message: "Subscription request submitted successfully",
        userInfo: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          customerType,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
        },
        token: nextToken,
      },
      { status: 200 },
    );

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
