import cloudinary from "@/lib/cloudinary";
import Category from "@/models/Category";
import { connectDB } from "@/utils/ConnectDB";
import { generateSlug } from "@/utils/generateSlug";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();
  const id = req.nextUrl.pathname.split("/").pop();
  const category = await Category.findById(id);
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function PATCH( req: NextRequest) {
  try {
    await connectDB();
    const data = await req.formData();

    const name = data.get("name") as string;
    const file = data.get("image") as File;
    const id = req.nextUrl.pathname.split("/").pop();
    const category = await Category.findById(id);
    if (!category)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (name) category.name = name;
    if (name) category.slug = generateSlug(name);

    if (file && file.name !== "undefined") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "categories" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(buffer);
      });
      category.image = (result as any).secure_url;
    }

    await category.save();

    return NextResponse.json({ category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const id = req.nextUrl.pathname.split("/").pop();
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Category deleted" });
}
