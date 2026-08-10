import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

const formateProduct = (products: any[]) => {
  const productArray = [];
  let i = 0;
  while (i < products.length) {
    let temp = [];
    let j = i;
    while (j < i + 3) {
      if (products[j]) {
        temp.push(products[j]);
      }
      j++;
    }
    productArray.push([...temp]);
    i = j;
  }
  return productArray;
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const priceRange = { low: 0, high: 0 };

    const products = await Product.find({}).limit(9).sort({ createdAt: -1 });
    const latest_product = formateProduct(products);

    const getForPrice = await Product.find({}).sort({ price: 1 });
    if (getForPrice.length > 0) {
      priceRange.high = getForPrice[getForPrice.length - 1].price;
      priceRange.low = getForPrice[0].price;
    }

    return NextResponse.json({ latest_product, priceRange }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
