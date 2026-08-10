// app/api/product/delete-card/[id]/route.ts
import { verifyToken } from "@/lib/auth";
import CardProduct from "@/models/Card";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest) {
  await connectDB();
  const id = req.nextUrl.pathname.split("/").slice(-1);
  const token = getTokenFromHeaders(req.headers);
if (!token) {
  return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });
}
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });

  await CardProduct.findOneAndDelete({ _id: id, userId: user.id });
  return NextResponse.json({ message: "Cart item removed" });
}
