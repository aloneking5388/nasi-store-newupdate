import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Seller from "@/models/Seller";
import { connectDB } from "@/utils/ConnectDB";
import { isAdmin } from "@/lib/api-middlewar";


export async function GET(req: NextRequest) {
  try {
    
    await connectDB();

    const admin = isAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized to access this route" },
        {
          status: 401,
        }
      );
    }

    const sellerId = req.nextUrl.pathname.split("/").pop(); // or use regex

    if (!mongoose.isValidObjectId(sellerId)) {
      return NextResponse.json(
        { error: "Invalid seller ID" },
        {
          status: 400,
        }
      );
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return NextResponse.json(
        { error: "Seller not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        userInfo: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          role: seller.role,
          status: seller.status,
          payment: seller.payment,
          profileImage: seller.profileImage,
          shopInfo: {
            shopName: seller.shopInfo?.shopName,
            division: seller.shopInfo?.division,
            district: seller.shopInfo?.district,
            sub_district: seller.shopInfo?.sub_district,
          }
      },
    },

      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
