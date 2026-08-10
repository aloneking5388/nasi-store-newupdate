import { CustomerOrder } from "@/models/CustomerOrder";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose"; // ✅ Import ObjectId

export async function GET( req: NextRequest) {
  try {
    await connectDB();
    const customerId = req.nextUrl.pathname.split("/").slice(-1)[0]; // Extract customerId from the URL
    const status = req.nextUrl.searchParams.get("status") || "all";
    const objectId = new mongoose.Types.ObjectId(customerId); // ✅ Correct usage

    let orders = [];

    if (status !== "all") {
      orders = await CustomerOrder.find({
        customerId: objectId,
        delivery_status: status,
      });
    } else {
      orders = await CustomerOrder.find({ customerId: objectId });
    }

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
