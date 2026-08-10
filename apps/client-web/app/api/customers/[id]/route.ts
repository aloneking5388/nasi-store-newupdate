import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/ConnectDB";
import User from "@/models/User";
import { resolveCustomerType } from "@/utils/customerType";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop(); // Extract ID from the URL

    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid seller ID" }, { status: 400 });
    }

    const customer = await User.findById(id);

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
          customerType: resolveCustomerType(customer),
          level: customer.level,
          profileImage: customer?.profileImage,
          earnings: customer.earnings,
          shippingInfo: customer.shippingInfo,
          referralCode: customer.referralCode,
          referralCount: customer.referralCount,
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
