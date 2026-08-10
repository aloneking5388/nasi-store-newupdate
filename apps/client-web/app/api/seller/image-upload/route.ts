import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Seller from "@/models/Seller";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/utils/ConnectDB";
import { getTokenFromHeaders } from "@/utils/getToken";


export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    
    if (!token) {
      return NextResponse.json({ error: "Token is missing" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "nasi-store-sellers" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    const updatedSeller = await Seller.findByIdAndUpdate(
      decoded.id,
      { profileImage: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedSeller);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
