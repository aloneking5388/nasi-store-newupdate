import { verifyToken } from "@/lib/auth";
import { CustomerOrder } from "@/models/CustomerOrder";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getTokenFromHeaders } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromHeaders(req.headers);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const orderId = req.nextUrl.pathname.split("/").pop(); // Extract orderId from the URL

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order = await CustomerOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
