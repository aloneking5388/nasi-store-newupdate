import jwt from "jsonwebtoken";
import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = getTokenFromHeaders(req.headers);

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const sellerId = decoded.id;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const parPage = Number(searchParams.get("parPage")) || 10;
  const searchValue = searchParams.get("searchValue")?.trim() || "";

  let query: any = { sellerId };
  let projection: any = {};
  let sort: any = { createdAt: -1 };

  if (searchValue) {
    query = {
      $and: [
        { sellerId },
        { $text: { $search: searchValue } },
      ],
    };
    projection = { score: { $meta: "textScore" } };
    sort = { score: { $meta: "textScore" }, createdAt: -1 };
  }

  const totalProduct = await Product.countDocuments(query);
  const products = await Product.find(query, projection)
    .sort(sort)
    .skip((page - 1) * parPage)
    .limit(parPage);

  const formattedProducts = products.map((product) => ({
    ...product.toObject(),
    id: product._id.toString(),
  }));

  return NextResponse.json({ products: formattedProducts, totalProduct });
}
