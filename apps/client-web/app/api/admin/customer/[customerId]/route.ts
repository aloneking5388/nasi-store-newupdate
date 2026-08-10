import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { isAdmin } from "@/lib/api-middlewar";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const customerId = req.nextUrl.pathname.split("/").pop(); // or use regex

    const result = isAdmin(req);

    if (result instanceof NextResponse) {
      return result; // Return the error response if not authorized
    }

    const admin = result; // This will be the decoded token if authorized

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized to access this route" },
        { status: 401 },
      );
    }

    if (!mongoose.isValidObjectId(customerId)) {
      return NextResponse.json({ error: "Invalid seller ID" }, { status: 400 });
    }

    const customer = await User.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        userInfo: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          status: customer.status,
          customerType: customer.customerType,
          level: customer.level,
          invested: customer.invested,
          profileImage: customer?.profileImage,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
