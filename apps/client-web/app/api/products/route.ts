import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { verifyToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary"; // Assuming you have a utility function for Cloudinary upload
import { generateSlug } from "@/utils/generateSlug";
import Seller from "@/models/Seller";
import { getTokenFromHeaders } from "@/utils/getToken";

const parseOptionArray = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fallback to csv parsing
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get token from headers
    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: "Token is missing." }, { status: 401 });
    }

    // Verify token and check user role/status
    const user = verifyToken(token);
    if (!user || user.role !== "seller" || user.status !== "active") {
      return NextResponse.json(
        { error: "Unauthorized seller." },
        { status: 403 },
      );
    }

    const { shopInfo } = await Seller.findById(user.id);

    if (!shopInfo) {
      return NextResponse.json(
        { error: "Shop information not found." },
        { status: 404 },
      );
    }

    // Parse form data
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = (formData.get("subcategory") as string) || "";
    const brand = formData.get("brand") as string;
    const stock = parseInt(formData.get("stock") as string);
    const discount = parseFloat(formData.get("discount") as string);
    const description = formData.get("description") as string;
    const sizes = parseOptionArray(formData.get("sizes"));
    const colors = parseOptionArray(formData.get("colors"));

    // Validate required fields
    if (!name || isNaN(price) || !category || !brand || isNaN(stock)) {
      return NextResponse.json(
        { error: "Missing or invalid fields." },
        { status: 400 },
      );
    }

    const images: string[] = [];

    // Handle multiple image uploads
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 },
      );
    }

    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = (await uploadToCloudinary(buffer)) as {
        secure_url: string;
      };

      if (!uploaded?.secure_url) {
        return NextResponse.json(
          { error: "Image upload failed." },
          { status: 500 },
        );
      }

      images.push(uploaded.secure_url);
    }

    // Create product in the
    const slug = generateSlug(name);
    const product = await Product.create({
      name,
      slug,
      price,
      category,
      subcategory,
      brand,
      stock,
      discount,
      description,
      images,
      sizes,
      colors,
      shopName: shopInfo.shopName,
      sellerId: user.id,
    });

    // Return success response
    return NextResponse.json({
      message: "Product added successfully",
      product,
    });
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: error.message || "Product adding Failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("parPage")) || 10;
  const searchValue = searchParams.get("searchValue") || "";

  let query: any = {};
  let projection: any = {};
  let sort: any = { createdAt: -1 };

  // Use text search if searchValue is provided
  if (searchValue) {
    query = { $text: { $search: searchValue } };
    projection = { score: { $meta: "textScore" } };
    sort = { score: { $meta: "textScore" } };
  }

  const totalProduct = await Product.countDocuments(query);

  const products = await Product.find(query, projection)
    .sort(sort)
    .skip((page - 1) * perPage)
    .limit(perPage);

  const formattedProducts = products.map((product) => ({
    ...product.toObject(),
    id: product._id.toString(),
  }));

  return NextResponse.json({ products: formattedProducts, totalProduct });
}
