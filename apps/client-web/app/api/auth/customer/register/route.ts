import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/utils/ConnectDB";
import jwt from "jsonwebtoken";
import { sendRegisterSuccessEmail } from "@/lib/registerHelper";
import { resolveCustomerType } from "@/utils/customerType";
import { applySubscriptionEnrollment } from "@/utils/subscriptionEnrollment";
import { validateSubscriptionEntry } from "@nasi/validation/subscription";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { name, email, password, referredBy, joiningFee } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = uuidv4().slice(0, 8);
    const normalizedReferral = referredBy?.trim() || "";
    const isSubscriptionSignup = normalizedReferral.length > 0;
    const parsedJoiningFee = Number(joiningFee || 0);

    let referrer;
    if (isSubscriptionSignup) {
      referrer = await validateSubscriptionEntry(
        normalizedReferral,
        parsedJoiningFee,
      );
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      referralCode,
      referredBy: null,
      invested: 0,
      customerType: "normal",
      status: "active",
    });

    await newUser.save();

    if (referrer) {
      await applySubscriptionEnrollment(newUser, referrer);
    }

    await sendRegisterSuccessEmail(email, name);

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        customerType: resolveCustomerType(newUser),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const data = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userInfo: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          customerType: resolveCustomerType(newUser),
          referredBy: newUser.referredBy,
        },
        token,
      },
      { status: 201 },
    );

    data.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return data;
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
