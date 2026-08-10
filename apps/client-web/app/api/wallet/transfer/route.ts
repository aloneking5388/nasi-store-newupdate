import { verifyToken } from "@/lib/auth";
import CustomerWallet from "@/models/CustomerWallet";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import { resolveCustomerType } from "@/utils/customerType";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decoded: any = await verifyToken(token); // Fix: decode the token
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user || resolveCustomerType(user) !== "subscription") {
      return NextResponse.json(
        { message: "Wallet is only available for subscription customers" },
        { status: 403 },
      );
    }

    if (user.earnings < amount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 },
      );
    }

    user.earnings -= amount;
    await user.save();

    const existingWallet = await CustomerWallet.findOne({
      customerId: user._id,
    });

    if (existingWallet) {
      existingWallet.amount += amount;
      await existingWallet.save();
    } else {
      await CustomerWallet.create({
        customerId: user._id,
        amount,
      });
    }
    await WalletTransaction.create({
      customerId: user._id,
      type: "credit",
      source: "earning",
      status: "success",
      amount,
      purpose: "Earning transfer to wallet",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Earning transferred to wallet successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
