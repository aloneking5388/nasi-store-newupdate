import cloudinary from "@/lib/cloudinary";
import Category from "@/models/Category";
import { connectDB } from "@/utils/ConnectDB";
import { generateSlug } from "@/utils/generateSlug";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const parPage = parseInt(searchParams.get("parPage") || "10");
  const searchValue = searchParams.get("searchValue") || "";

  const query: any = {};
  if (searchValue.trim()) {
    query.$text = { $search: searchValue };
  }

  const total = await Category.countDocuments(query);

  const categorys = await Category.find(
    query,
    searchValue ? { score: { $meta: "textScore" } } : {},
  )
    .sort(searchValue ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((page - 1) * parPage)
    .limit(parPage);

  return NextResponse.json({ categorys, totalCategory: total });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.formData();

    const name = data.get("name") as string;
    const subcategoriesRaw = (data.get("subcategories") as string) || "";
    const file = data.get("image") as File;

    if (!name || !file) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upload image to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "categories" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(buffer);
    });

    const { secure_url } = result as any;

    const slug = generateSlug(name);
    const subcategories = subcategoriesRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const newCategory = await Category.create({
      name,
      subcategories,
      image: secure_url,
      slug,
    });

    const res = NextResponse.json(
      {
        success: true,
        category: newCategory,
        message: "Category add Successfuy",
      },
      { status: 201 },
    );

    return res;
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "somthing wrong",
        error: err.message,
      },
      { status: 500 },
    );
  }
}
