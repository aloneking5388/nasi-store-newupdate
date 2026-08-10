import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface Params {
  slug: string;
}

interface ProductType {
  _id: Types.ObjectId | string;
  sellerId: Types.ObjectId | string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  stock: number;
  discount: number;
  description: string;
  shopName: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const slug = req.nextUrl.pathname.split("/").pop() as string;

  try {
    // Find main product
    const product = await Product.findOne({ slug }).lean<ProductType>();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sellerId = product.sellerId.toString();
    const category = product.category;

    const [relatedProducts, moreProducts] = await Promise.all([
      Product.find({
        _id: { $ne: product._id },
        category,
      })
        .limit(20)
        .lean<ProductType[]>(),

      Product.find({
        _id: { $ne: product._id },
        sellerId,
      })
        .limit(3)
        .lean<ProductType[]>(),
    ]);

    const formatProduct = (p: ProductType) => ({
      ...p,
      id: p._id.toString(),
    });

    return NextResponse.json(
      {
        product: formatProduct(product),
        relatedProducts: relatedProducts.map(formatProduct),
        moreProducts: moreProducts.map(formatProduct),
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
