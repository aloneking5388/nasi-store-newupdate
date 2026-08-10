// app/api/product/add-to-wishlist/route.ts
import { verifyToken } from "@/lib/auth";
import Wishlist from "@/models/Wishlist";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  const token = getTokenFromHeaders(req.headers);
if (!token) {
  return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });
}
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newItem = await Wishlist.create({ ...body, userId: user.id });

  return NextResponse.json({ message: "Added to wishlist", item: newItem });
}
