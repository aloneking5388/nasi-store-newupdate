import { connectDB } from "@/utils/ConnectDB";
import Wishlist from "@/models/Wishlist";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();

  const userId = req.nextUrl.pathname.split("/").slice(-1)[0]; // Extract userId from the URL

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const wishlistItems = await Wishlist.find({ userId });
    return NextResponse.json({ wishlistItems });
  } catch (error) {
    return NextResponse.json({ error: "Get wishlistItems failed" }, { status: 500 });
  }
}
