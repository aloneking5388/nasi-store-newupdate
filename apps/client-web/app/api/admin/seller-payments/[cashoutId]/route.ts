import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { isAdmin } from "@/lib/api-middlewar";
import SellerCashout from "@/models/SellerCashout";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cashoutId: string }> },
) {
  try {
    await connectDB();

    const admin = isAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const { cashoutId } = await params;
    const body = await req.json();
    const status = String(body?.status || "").trim();

    if (!cashoutId) {
      return NextResponse.json(
        { message: "Cashout ID is required" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const cashout = await SellerCashout.findById(cashoutId);
    if (!cashout) {
      return NextResponse.json(
        { message: "Cashout not found" },
        { status: 404 },
      );
    }

    cashout.status = status as "pending" | "approved" | "rejected";
    await cashout.save();

    const io = globalThis.chatIO as any;
    if (io) {
      io.emit("seller:cashout-updated", {
        sellerId: cashout.sellerId.toString(),
        cashoutId: cashout._id.toString(),
      });
      io.to(`user:${cashout.sellerId.toString()}`).emit(
        "seller:cashout-updated",
        {
          sellerId: cashout.sellerId.toString(),
          cashoutId: cashout._id.toString(),
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Cashout ${status}`,
        cashout: {
          id: cashout._id.toString(),
          sellerId: cashout.sellerId.toString(),
          amount: cashout.amount,
          note: cashout.note || "",
          status: cashout.status,
          createdAt: cashout.createdAt,
          updatedAt: cashout.updatedAt,
        },
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
