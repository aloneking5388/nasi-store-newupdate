import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getChatUserFromHeaders } from "@/lib/chatAuth";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const authUser = getChatUserFromHeaders(req.headers);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, and WEBP images are allowed" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = (await uploadToCloudinary(buffer, "chat-media")) as {
      secure_url: string;
    };

    return NextResponse.json({ success: true, url: upload.secure_url });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
