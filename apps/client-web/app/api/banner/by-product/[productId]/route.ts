import { connectDB } from "@/utils/ConnectDB";
import Banner from "@/models/Benners";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {
    await connectDB();
    const productId = req.nextUrl.pathname.split("/").pop(); // Extract productId from the URL
    const banner = await Banner.findOne({ productId });

    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
