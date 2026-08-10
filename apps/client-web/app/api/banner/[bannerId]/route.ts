// app/api/banner/[bannerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import Banner from "@/models/Benners";
import { uploadToCloudinary } from "@/lib/cloudinary";

// GET banner by ID
export async function GET(req: NextRequest) {
  await connectDB();
  const bannerId = req.nextUrl.pathname.split("/").pop(); // or use regex

  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT update banner by ID

export async function PUT( req: NextRequest ) {
  await connectDB();

  try {
    const bannerId = req.nextUrl.pathname.split("/").pop(); // Extract bannerId from the URL
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const image = formData.get("image") as File;

    // Check if the banner exists
    const existingBanner = await Banner.findById(bannerId);
    if (!existingBanner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    let imageUrl = existingBanner.banner;

    // If a new image is provided
    if (image && image.size > 0 && image.type.startsWith("image/")) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const result = (await uploadToCloudinary(buffer, "banners")) as {
        secure_url: string;
      };
      imageUrl = result.secure_url;
    }

    // Update the banner
    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      {
        ...(productId && { productId }),
        banner: imageUrl,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Banner updated successfully", banner: updatedBanner },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
