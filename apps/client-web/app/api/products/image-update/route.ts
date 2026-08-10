import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";  // Import Cloudinary

export async function POST(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const user = await verifyToken(token);

  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const oldImage = formData.get("oldImage") as File;
  const newImage = formData.get("newImage") as File;
  const productId = formData.get("productId") as string;

  if (!newImage || !productId || !oldImage) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await deleteFromCloudinary(product.images[0]);
  const imageUpload = await uploadToCloudinary(newImage);

  product.images[0] = imageUpload.secure_url;
  await product.save();

  return NextResponse.json({ message: "Product image updated", product });
}

async function deleteFromCloudinary(imageUrl: string) {
  const publicId = imageUrl.split("/").pop()?.split(".")[0];
  if (publicId) {
    await cloudinary.uploader.destroy(`nasi-store-products/${publicId}`);
  }
}

async function uploadToCloudinary(file: File) {
  const buffer = await file.arrayBuffer();
  const mime = file.type;
  const base64 = Buffer.from(buffer).toString("base64");
  const dataURI = `data:${mime};base64,${base64}`;

  return await cloudinary.uploader.upload(dataURI, {
    folder: "nasi-store-products",
  });
}
