import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "@/models/Seller";
import { connectDB } from "@/utils/ConnectDB";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, method } = await req.json();

    if (!email || !password || !name || !method) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if the seller already exists
    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return NextResponse.json(
        { error: "Seller already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      method: method || "email", 
    });

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        status: seller.status,
        profileImage: seller.profileImage,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const data = NextResponse.json(
      {
        success: true,
        message: "Seller registered successfully",
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

    // Set the token in cookies
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
      { error: "Seller Register failed" },
      { status: 500 }
    );
  }
}
