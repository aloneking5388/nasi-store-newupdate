import Seller from "@/models/Seller";
import { connectDB } from "@/utils/ConnectDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const seller = await Seller.findOne({ email }).select("+password");

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, seller.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: seller._id,
        role: seller.role,
        name: seller.name,
        email: seller.email,
        profileImage: seller.profileImage,
        status: seller.status,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const data = NextResponse.json(
      {
        success: true,
        message: "Seller Login successfully",
        userInfo: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          role: seller.role,
          status: seller.status,
          profileImage: seller.profileImage,
        },
        token
      },
      { status: 201 }
    );

    data.cookies.set("token", token, {
      httpOnly: true,  // Secure against XSS attacks
      secure: process.env.NODE_ENV === "production",  // Only true in production
      sameSite: "strict",  // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60,  // Token expiry (7 days)
      path: "/",
    });

    return data;
    
  } catch (error) {
    return NextResponse.json(
      { error: "Seller login failed" },
      { status: 500 }
    );
  }
}
