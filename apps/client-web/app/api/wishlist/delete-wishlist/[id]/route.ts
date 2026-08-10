import { NextRequest, NextResponse } from "next/server";
import Wishlist from "@/models/Wishlist";
import { connectDB } from "@/utils/ConnectDB";
import { verifyToken } from "@/lib/auth";
import { getTokenFromHeaders } from "@/utils/getToken";

export async function DELETE( req: NextRequest) {
  await connectDB();

  try {
    const id = req.nextUrl.pathname.split("/").slice(-1)[0]; // Extract id from the URL

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 401 });

    const deleted = await Wishlist.findOneAndDelete({ _id: id, userId: user.id });
    if (!deleted) {
      return NextResponse.json({ errorMessage: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Wishlist item removed" });
  } catch (error: any) {
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json({ errorMessage: "Internal Server Error" }, { status: 500 });
  }
}
