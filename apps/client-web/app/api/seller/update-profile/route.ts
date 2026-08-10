import { NextRequest, NextResponse } from "next/server";
import Seller from "@/models/Seller";
import { connectDB } from "@/utils/ConnectDB";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@nasi/types/auth";
import { getTokenFromHeaders } from "@/utils/getToken";

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);

    if (!token) {
      return NextResponse.json({ error: "Token is missing" }, { status: 401 });
    }

    const decoded = (await verifyToken(token)) as DecodedToken;

    if (!decoded?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();
    const { name, status, payment, profileImage, shopInfo } = body;

    const seller = await Seller.findOne({ email: decoded.email });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    seller.name = name || seller.name;
    seller.status = status || seller.status;
    seller.payment = payment || seller.payment;
    seller.profileImage = profileImage || seller.profileImage;
    if (shopInfo) {
      seller.shopInfo = { ...seller.shopInfo, ...shopInfo };
      seller.markModified("shopInfo");
    }

    await seller.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      updatedUser: seller,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
