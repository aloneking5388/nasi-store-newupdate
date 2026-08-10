import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/ConnectDB";
import { isAdmin } from "@/lib/api-middlewar";
import Seller from "@/models/Seller";
import SellerWallet from "@/models/SellerWallet";
import SellerCashout from "@/models/SellerCashout";

type LeanSeller = {
  _id: mongoose.Types.ObjectId;
  name?: string;
  profileImage?: string;
};

type LeanSellerWallet = {
  _id: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId | string;
  amount: number;
  createdAt: Date;
};

type LeanSellerCashout = {
  _id: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId | string;
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

const toObjectIdString = (value: mongoose.Types.ObjectId | string) =>
  typeof value === "string" ? value : value.toString();

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = isAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const sellers = (await Seller.find(
      {},
      { name: 1, profileImage: 1 },
    ).lean()) as unknown as LeanSeller[];
    const sellerMap = new Map(
      sellers.map((seller) => [seller._id.toString(), seller]),
    );

    const walletEntries = (await SellerWallet.find({})
      .sort({ createdAt: -1 })
      .lean()) as unknown as LeanSellerWallet[];
    const cashouts = (await SellerCashout.find({})
      .sort({ createdAt: -1 })
      .lean()) as unknown as LeanSellerCashout[];

    const balanceBySeller = new Map<string, number>();
    for (const entry of walletEntries) {
      const sellerId = toObjectIdString(entry.sellerId);
      balanceBySeller.set(
        sellerId,
        (balanceBySeller.get(sellerId) || 0) + (entry.amount || 0),
      );
    }

    const cashoutBySeller = new Map<string, number>();
    const availableCashoutBySeller = new Map<string, number>();
    for (const cashout of cashouts) {
      const sellerId = toObjectIdString(cashout.sellerId);
      if (["pending", "approved"].includes(cashout.status)) {
        cashoutBySeller.set(
          sellerId,
          (cashoutBySeller.get(sellerId) || 0) + (cashout.amount || 0),
        );
      }
    }

    const sellerBalances = Array.from(balanceBySeller.entries())
      .map(([sellerId, totalBalance]) => {
        const seller = sellerMap.get(sellerId);
        const reserved = cashoutBySeller.get(sellerId) || 0;
        const availableBalance = Math.max(totalBalance - reserved, 0);
        availableCashoutBySeller.set(sellerId, availableBalance);

        return {
          sellerId,
          sellerName: seller?.name || "Unknown seller",
          profileImage: seller?.profileImage || "",
          totalBalance,
          availableBalance,
          reservedCashout: reserved,
        };
      })
      .sort((a, b) => b.availableBalance - a.availableBalance)
      .slice(0, 8);

    const totalSellerBalance = walletEntries.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0,
    );
    const totalReservedCashouts = cashouts
      .filter((cashout) => ["pending", "approved"].includes(cashout.status))
      .reduce((sum, cashout) => sum + (cashout.amount || 0), 0);
    const totalCashoutBalance = Math.max(
      totalSellerBalance - totalReservedCashouts,
      0,
    );
    const recentCashoutBalance = cashouts[0]?.amount || 0;

    const recentCashouts = cashouts.slice(0, 10).map((cashout) => {
      const sellerId = toObjectIdString(cashout.sellerId);
      const seller = sellerMap.get(sellerId);

      return {
        id: cashout._id.toString(),
        sellerId,
        sellerName: seller?.name || "Unknown seller",
        profileImage: seller?.profileImage || "",
        amount: cashout.amount,
        note: cashout.note || "",
        status: cashout.status,
        createdAt: cashout.createdAt,
        updatedAt: cashout.updatedAt,
        monthLabel:
          cashout.createdAt != null
            ? `${monthNames[new Date(cashout.createdAt).getMonth()]} ${new Date(
                cashout.createdAt,
              ).getFullYear()}`
            : "",
      };
    });

    return NextResponse.json(
      {
        totalSellerBalance,
        totalCashoutBalance,
        recentCashoutBalance,
        totalPendingCashouts: cashouts.filter(
          (cashout) => cashout.status === "pending",
        ).length,
        totalApprovedCashouts: cashouts.filter(
          (cashout) => cashout.status === "approved",
        ).length,
        totalRejectedCashouts: cashouts.filter(
          (cashout) => cashout.status === "rejected",
        ).length,
        sellerBalances,
        recentCashouts,
        allCashouts: cashouts.map((cashout) => {
          const sellerId = toObjectIdString(cashout.sellerId);
          const seller = sellerMap.get(sellerId);

          return {
            id: cashout._id.toString(),
            sellerId,
            sellerName: seller?.name || "Unknown seller",
            profileImage: seller?.profileImage || "",
            amount: cashout.amount,
            note: cashout.note || "",
            status: cashout.status,
            createdAt: cashout.createdAt,
            updatedAt: cashout.updatedAt,
            monthLabel:
              cashout.createdAt != null
                ? `${monthNames[new Date(cashout.createdAt).getMonth()]} ${new Date(
                    cashout.createdAt,
                  ).getFullYear()}`
                : "",
          };
        }),
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
