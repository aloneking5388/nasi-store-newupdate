import { CustomerOrder } from "@/models/CustomerOrder";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import CardProduct from "@/models/Card";
import Wishlist from "@/models/Wishlist";
import CustomerWallet from "@/models/CustomerWallet";
import { resolveCustomerType } from "@/utils/customerType";

export async function GET(req: NextRequest) {
  await connectDB();

  const userId = req.nextUrl.pathname.split("/").pop();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const customerId = new mongoose.Types.ObjectId(userId);

  try {
    const [
      user,
      wallet,
      recentOrders,
      totalOrders,
      pendingOrders,
      paidOrders,
      unpaidOrders,
    ] = await Promise.all([
      User.findById(customerId).select("-password"),
      CustomerWallet.findOne({ customerId }).select("amount"),
      CustomerOrder.find({ customerId }).sort({ createdAt: -1 }).limit(5),
      CustomerOrder.countDocuments({ customerId }),
      CustomerOrder.countDocuments({ customerId, delivery_status: "pending" }),
      CustomerOrder.countDocuments({ customerId, payment_status: "paid" }),
      CustomerOrder.countDocuments({ customerId, payment_status: "unpaid" }),
    ]);

    const customerType = resolveCustomerType(user);

    return NextResponse.json(
      {
        user: user
          ? {
              id: user._id,
              name: user.name,
              email: user.email,
              status: user.status,
              role: user.role,
              customerType,
              referralCode:
                customerType === "subscription" ? user.referralCode : undefined,
              referralCount:
                customerType === "subscription"
                  ? user.referralCount
                  : undefined,
            }
          : null,
        walletBalance:
          customerType === "subscription" ? wallet?.amount || 0 : 0,
        recentOrders,
        totalOrders,
        orderCounts: {
          pending: pendingOrders,
          paid: paidOrders,
          unpaid: unpaidOrders,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer data" },
      { status: 500 },
    );
  }
}
