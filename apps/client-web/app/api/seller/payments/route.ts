import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { verifyToken } from "@/lib/auth";
import SellerWallet from "@/models/SellerWallet";
import SellerCashout from "@/models/SellerCashout";
import mongoose from "mongoose";

type LeanSellerWallet = {
  _id: mongoose.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
};

type LeanSellerCashout = {
  _id: mongoose.Types.ObjectId;
  amount: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const mapCashout = (cashout: any) => ({
  id: cashout._id.toString(),
  amount: cashout.amount,
  note: cashout.note || "",
  status: cashout.status,
  createdAt: cashout.createdAt,
  updatedAt: cashout.updatedAt,
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sellerId = decoded.id;
    const walletEntries = (await SellerWallet.find({ sellerId })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean()) as unknown as LeanSellerWallet[];
    const cashouts = (await SellerCashout.find({ sellerId })
      .sort({ createdAt: -1 })
      .lean()) as unknown as LeanSellerCashout[];

    const totalBalance = walletEntries.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0,
    );
    const reservedCashout = cashouts
      .filter((cashout) => ["pending", "approved"].includes(cashout.status))
      .reduce((sum, cashout) => sum + (cashout.amount || 0), 0);
    const cashoutBalance = Math.max(totalBalance - reservedCashout, 0);
    const recentCashoutBalance = cashouts[0]?.amount || 0;

    const history = cashouts.map((cashout) => ({
      ...mapCashout(cashout),
      monthLabel:
        cashout.createdAt != null
          ? `${monthNames[new Date(cashout.createdAt).getMonth()]} ${new Date(
              cashout.createdAt,
            ).getFullYear()}`
          : "",
    }));

    const earningHistory = walletEntries.map((entry) => ({
      id: entry._id.toString(),
      amount: entry.amount,
      month: entry.month,
      year: entry.year,
      label: `${monthNames[(entry.month || 1) - 1]} ${entry.year}`,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    return NextResponse.json(
      {
        totalBalance,
        cashoutBalance,
        recentCashoutBalance,
        history,
        earningHistory,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sellerId = decoded.id;
    const body = await req.json();
    const amount = Number(body?.amount || 0);
    const note = String(body?.note || "").trim();

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const walletEntries = (await SellerWallet.find({
      sellerId,
    }).lean()) as unknown as LeanSellerWallet[];
    const cashouts = (await SellerCashout.find({
      sellerId,
    }).lean()) as unknown as LeanSellerCashout[];

    const totalBalance = walletEntries.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0,
    );
    const reservedCashout = cashouts
      .filter((cashout) => ["pending", "approved"].includes(cashout.status))
      .reduce((sum, cashout) => sum + (cashout.amount || 0), 0);
    const cashoutBalance = Math.max(totalBalance - reservedCashout, 0);

    if (amount > cashoutBalance) {
      return NextResponse.json(
        {
          message: "Requested amount is greater than available cashout balance",
        },
        { status: 400 },
      );
    }

    const cashout = await SellerCashout.create({
      sellerId,
      amount,
      note,
      status: "pending",
    });

    const io = globalThis.chatIO as any;
    if (io) {
      io.emit("seller:cashout-updated", {
        sellerId,
        cashoutId: cashout._id.toString(),
      });
      io.to(`user:${sellerId}`).emit("seller:cashout-updated", {
        sellerId,
        cashoutId: cashout._id.toString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cashout request submitted successfully",
        cashout: mapCashout(cashout),
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
