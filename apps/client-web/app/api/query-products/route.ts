import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

interface FilterQuery {
  price: { $gte: number; $lte: number };
  category?: string;
  $or?: Array<{ category: string } | { subcategory: string }>;
  rating?: { $gte: number };
  $text?: { $search: string };
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.nextUrl);
  const parPage = 12;

  const category = searchParams.get("category") || undefined;
  const rating = isNaN(parseFloat(searchParams.get("rating") || "0"))
    ? 0
    : parseFloat(searchParams.get("rating")!);
  const searchValue = searchParams.get("searchValue")?.trim();
  const sortPrice = searchParams.get("sortPrice");
  const lowPrice = parseFloat(searchParams.get("lowPrice") || "0");
  const highPrice = parseFloat(
    searchParams.get("highPrice") || `${Number.MAX_SAFE_INTEGER}`,
  );
  const pageNumber = Math.max(
    parseInt(searchParams.get("pageNumber") || "1"),
    1,
  );

  const filter: FilterQuery = {
    price: { $gte: lowPrice, $lte: highPrice },
  };

  if (category) {
    filter.$or = [{ category }, { subcategory: category }];
  }
  if (rating > 0) filter.rating = { $gte: rating };
  if (searchValue && searchValue !== "")
    filter.$text = { $search: searchValue };

  let sort: any = { createdAt: -1 };
  if (searchValue && searchValue !== "")
    sort = { score: { $meta: "textScore" } };
  else if (sortPrice === "low-to-high") sort = { price: 1 };
  else if (sortPrice === "high-to-low") sort = { price: -1 };

  try {
    const totalProduct = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProduct / parPage);

    const products = await Product.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * parPage)
      .limit(parPage)
      .select({
        name: 1,
        price: 1,
        category: 1,
        images: 1,
        rating: 1,
        slug: 1,
        ...(searchValue ? { score: { $meta: "textScore" } } : {}),
      });

    return NextResponse.json(
      { products, totalProduct, totalPages, parPage },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
