import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import AuthorOrder from "@/models/AuthOrder";
import { CustomerOrder } from "@/models/CustomerOrder";

interface JwtPayload {
  id: string;
  role: "admin" | "seller";
}

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.max(1, parseInt(searchParams.get("parPage") || "10"));
    const searchValue = searchParams.get("searchValue")?.trim() || "";

    // Token Verification
    const tokenString = getTokenFromHeaders(req.headers);
    if (!tokenString) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let token: JwtPayload;
    try {
      token = jwt.verify(tokenString, secret) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { role, id: userId } = token;

    // === Common Config ===
    const skipPage = (page - 1) * perPage;

    // === Admin Logic ===
    if (role === "admin") {
      const matchStage: any = searchValue
        ? {
            $match: {
              $or: [
                { payment_status: { $regex: searchValue, $options: "i" } },
                { delivery_status: { $regex: searchValue, $options: "i" } },
                { price: { $regex: searchValue, $options: "i" } },
              ],
            },
          }
        : {};

      const pipeline = [
        ...(searchValue ? [matchStage] : []),
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "suborder",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skipPage },
        { $limit: perPage },
      ];

      const orders = await CustomerOrder.aggregate(pipeline);
      const totalOrders = await CustomerOrder.aggregate([
        ...(searchValue ? [matchStage] : [{ $match: {} }]),
      ]);

      return NextResponse.json(
        { success: true, orders, totalDocs: totalOrders.length },
        { status: 200 }
      );
    }

    // === Seller Logic ===
    if (role === "seller") {
      const query: any = { sellerId: userId };
      if (searchValue) {
        query.$text = { $search: searchValue };
      }

      const projection = searchValue ? { score: { $meta: "textScore" } } : {};
      let sort: Record<string, any>;
      if (searchValue) {
        sort = { score: { $meta: "textScore" } };
      } else {
        sort = { createdAt: -1 };
      }

      const [orders, totalDocs] = await Promise.all([
        AuthorOrder.find(query, projection)
          .sort(sort)
          .skip(skipPage)
          .limit(perPage),
        AuthorOrder.countDocuments(query),
      ]);

      return NextResponse.json(
        { success: true, orders, totalDocs },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Merged Order API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
