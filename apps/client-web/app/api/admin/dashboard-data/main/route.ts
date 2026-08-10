import AuthorOrder from "@/models/AuthOrder";
import Product from "@/models/Product";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import MyShopWallet from "@/models/MyShopWallet";
import SellerWallet from "@/models/SellerWallet";
import mongoose from "mongoose";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const currentYear = new Date().getFullYear();
    const tokenString = getTokenFromHeaders(req.headers);
    if (!tokenString) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode or verify the token here (example using JWT)
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let token: any;
    try {
      token = jwt.verify(tokenString, secret);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const role = token.role;
    const userId = token.id;

    if (role === "admin") {
      const totalRevenue = await MyShopWallet.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalProducts = await Product.countDocuments();
      const totalOrders = await AuthorOrder.countDocuments();
      const totalPendingOrders = await AuthorOrder.countDocuments({
        delivery_status: "pending",
      });

      // Monthly customer registration (chart)
      const monthlyCustomers = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
      ]);
      // Monthly Revenue
      const monthlyRevenue = await MyShopWallet.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Monthly Orders
      const monthlyOrders = await AuthorOrder.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
      ]);

      const monthlyRevenueData = Array(12).fill(0);
      monthlyRevenue.forEach((entry) => {
        monthlyRevenueData[entry._id - 1] = entry.total;
      });

      const monthlyOrdersData = Array(12).fill(0);
      monthlyOrders.forEach((entry) => {
        monthlyOrdersData[entry._id - 1] = entry.count;
      });

      const monthlyCustomersData = Array(12).fill(0);
      monthlyCustomers.forEach((entry) => {
        const monthIndex = entry._id - 1;
        monthlyCustomersData[monthIndex] = entry.count;
      });

      return NextResponse.json(
        {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalProducts,
          totalOrders,
          totalPendingOrders,
          monthlyCustomers: monthlyCustomersData,
          monthlyRevenue: monthlyRevenueData,
          monthlyOrders: monthlyOrdersData,
        },
        { status: 200 }
      );
    }

    if (role === "seller") {
      const sellerObjectId = new mongoose.Types.ObjectId(userId);

      const totalSellersProducts = await Product.countDocuments({
        sellerId: sellerObjectId,
      });

      const totalSellersOrders = await AuthorOrder.countDocuments({
        sellerId: sellerObjectId,
      });

      const totalSellersPendingOrders = await AuthorOrder.countDocuments({
        sellerId: sellerObjectId,
        delivery_status: "pending",
      });

      const totalSellersRevenue = await SellerWallet.aggregate([
        { $match: { sellerId: sellerObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const monthlySellerRevenue = await SellerWallet.aggregate([
        {
          $match: {
            sellerId: sellerObjectId,
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$amount" },
          },
        },
      ]);

      const monthlySellerOrders = await AuthorOrder.aggregate([
        {
          $match: {
            sellerId: sellerObjectId, // ensure this matches your model
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
      ]);

      const monthlySales = await AuthorOrder.aggregate([
        {
          $match: {
            sellerId: sellerObjectId, // ensure this matches your model
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalQuantity: { $sum: "$products.quantity" },
          },
        },
      ]);

      const monthlySalesData = Array(12).fill(0);
      monthlySales.forEach((entry) => {
        monthlySalesData[entry._id - 1] = entry.totalQuantity;
      });

      const monthlyRevenueData = Array(12).fill(0);
      monthlySellerRevenue.forEach((entry) => {
        monthlyRevenueData[entry._id - 1] = entry.total;
      });

      const monthlyOrdersData = Array(12).fill(0);
      monthlySellerOrders.forEach((entry) => {
        monthlyOrdersData[entry._id - 1] = entry.count;
      });

      return NextResponse.json(
        {
          totalRevenue: totalSellersRevenue[0]?.total || 0,
          totalProducts: totalSellersProducts,
          totalOrders: totalSellersOrders,
          totalPendingOrders: totalSellersPendingOrders,
          monthlyRevenue: monthlyRevenueData,
          monthlyOrders: monthlyOrdersData,
          monthlySales: monthlySalesData,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
};
