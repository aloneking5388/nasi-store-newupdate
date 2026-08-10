import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Product from "@/models/Product";
import Banner from "@/models/Benners";

export async function POST(req: NextRequest) {
  
  try {
    await connectDB();
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const image = formData.get("image") as File;

    // Validation check
    if (!productId || !image) {
      return NextResponse.json(
        { message: "Missing productId or image" },
        { status: 400 }
      );
    }

    // Validate the image type and size (optional but recommended)
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Convert image file to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const cloudinaryResult = (await uploadToCloudinary(buffer, "banners")) as {secure_url: string};

    // Get product slug
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Save banner to the database
    const newBanner = await Banner.create({
      productId,
      banner: cloudinaryResult.secure_url,
      link: product.slug,
    });

    return NextResponse.json(
      { message: "Banner added successfully", banner: newBanner },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding banner:", error); // Log error for debugging
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}