import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/utils/ConnectDB";
import WalletTransaction from "@/models/WalletTransaction";
import CustomerWallet from "@/models/CustomerWallet";
import User from "@/models/User";
import { getTokenFromHeaders } from "@/utils/getToken";
import { resolveCustomerType } from "@/utils/customerType";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decoded: any = await verifyToken(token);
    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || resolveCustomerType(user) !== "subscription") {
      return NextResponse.json(
        { message: "Wallet is only available for subscription customers" },
        { status: 403 },
      );
    }
    const wallet = await CustomerWallet.findOne({ customerId: userId });
    const transactions = await WalletTransaction.find({
      customerId: userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        walletBalance: wallet?.amount || 0,
        referralEarnings: user?.earnings || 0,
        transactions,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
