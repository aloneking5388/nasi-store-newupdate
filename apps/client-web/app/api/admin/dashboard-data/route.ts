import Seller from "@/models/Seller";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { buildTextSearchQuery } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";
import { SortOrder } from "mongoose";
import { getTokenFromHeaders } from "@/utils/getToken";
import { verifyToken } from "@/lib/auth";
import { isAdmin } from "@/lib/api-middlewar";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const admin = isAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized to access this route" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.nextUrl);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("parPage") || "10");
    const searchValue = searchParams.get("searchValue") || "";
    const status = searchParams.get("status") || "active";

    const query = buildTextSearchQuery(searchValue, status);

    // Apply textScore projection & sort only if searching
    const projection = searchValue.trim()
      ? { score: { $meta: "textScore" } }
      : undefined;

    const sortOption: Record<string, SortOrder | { $meta: "textScore" }> =
      searchValue.trim()
        ? { score: { $meta: "textScore" } }
        : { createdAt: -1 }; // fallback sort

    const [totalSellers, totalCustomers, sellers, customers] =
      await Promise.all([
        Seller.countDocuments(query),
        User.countDocuments(query),
        Seller.find(query, projection)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .sort(sortOption),
        User.find(query, projection)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .sort(sortOption),
      ]);

    return NextResponse.json(
      {
        sellers,
        totalSellers,
        customers,
        totalCustomers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    await connectDB();
    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { sellerId, status } = body;

    if (!["pending", "active", "suspended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { status },
      { new: true }
    );

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Seller status updated", seller },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error },
      { status: 500 }
    );
  }
};
