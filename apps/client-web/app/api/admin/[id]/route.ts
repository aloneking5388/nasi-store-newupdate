import { verifyToken } from "@/lib/auth";
import Admin from "@/models/Admin";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extracting `Id` from the URL path
    const id = req.nextUrl.pathname.split("/").pop(); // or use regex

    const admin = await Admin.findById(id);

    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        userInfo: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
