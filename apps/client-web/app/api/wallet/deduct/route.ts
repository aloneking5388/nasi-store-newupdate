import { verifyToken } from "@/lib/auth";
import { settleOrderPayment } from "@/lib/paymentSettlement";
import CustomerWallet from "@/models/CustomerWallet";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { CustomerOrder } from "@/models/CustomerOrder";
import AuthorOrder from "@/models/AuthOrder";
import User from "@/models/User";
import { resolveCustomerType } from "@/utils/customerType";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = await verifyToken(token);
    const customerId = decoded.id;
    const { payAmount, orderId } = await req.json();

    if (!payAmount || !orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { message: "Invalid customer ID" },
        { status: 400 },
      );
    }

    const customerObjectId = new mongoose.Types.ObjectId(customerId);
    const orderObjectId = new mongoose.Types.ObjectId(orderId);
    const user = await User.findById(customerObjectId);

    if (!user || resolveCustomerType(user) !== "subscription") {
      return NextResponse.json(
        { message: "Wallet is only available for subscription customers" },
        { status: 403 },
      );
    }

    // ✅ Check: Order exists
    const customerOrder = await CustomerOrder.findById(orderObjectId);
    if (!customerOrder) {
      return NextResponse.json(
        { message: "Customer order not found" },
        { status: 404 },
      );
    }

    // ✅ Check: AuthorOrders exist
    const authorOrders = await AuthorOrder.find({
      $or: [{ orderId: orderObjectId }, { orderId: orderObjectId.toString() }],
    });

    if (!authorOrders || authorOrders.length === 0) {
      return NextResponse.json(
        { message: "Author orders not found" },
        { status: 404 },
      );
    }

    // ✅ Check: Wallet exists and has enough balance
    const wallet = await CustomerWallet.findOne({
      customerId: customerObjectId,
    });
    if (!wallet || wallet.amount < payAmount) {
      return NextResponse.json(
        { message: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    const result = await settleOrderPayment({
      orderId,
      walletAmount: payAmount,
      source: "wallet",
    });

    return NextResponse.json(
      { success: true, message: result.message, amount: payAmount },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
