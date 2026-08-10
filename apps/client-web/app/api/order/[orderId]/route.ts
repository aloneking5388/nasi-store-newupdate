import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import AuthorOrder from "@/models/AuthOrder";
import { CustomerOrder } from "@/models/CustomerOrder";

interface JwtPayload {
  id: string;
  role: "admin" | "seller";
}

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const tokenString = getTokenFromHeaders(req.headers);
    if (!tokenString) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let token: JwtPayload;

    try {
      token = jwt.verify(tokenString, secret) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { role, id: userId } = token;

    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const orderId = pathSegments[pathSegments.length - 1];

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Order ID" },
        { status: 400 }
      );
    }

    let order: any;

    if (role === "admin") {
      order = await CustomerOrder.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(orderId) },
        },
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "suborder",
          },
        },
      ]);
    } else {
      order = await AuthorOrder.findOne({
        _id: orderId,
        sellerId: userId,
      }).lean();
    }

    if (!order || (Array.isArray(order) && order.length === 0)) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    const normalizedOrder = Array.isArray(order) ? order[0] : order;
    return NextResponse.json(
      { success: true, data: normalizedOrder },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();

    // Extract and verify token
    const tokenString = getTokenFromHeaders(req.headers);
    if (!tokenString) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let token: JwtPayload;
    try {
      token = jwt.verify(tokenString, secret) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Extract order ID from URL
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const orderId = pathSegments[pathSegments.length - 1];

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Order ID" },
        { status: 400 }
      );
    }

    // Extract status from body
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json(
        { success: false, message: "Missing status in request body" },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await CustomerOrder.findOneAndUpdate(
      { _id: orderId },
      { delivery_status: status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Order status updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Order Update Error:", error); // Optional: log only in dev
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
