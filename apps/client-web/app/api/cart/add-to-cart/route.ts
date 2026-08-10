// app/api/product/add-to-card/route.ts
import CardProduct from "@/models/Card";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { productId, quantity, userId } = await req.json(); // ✅ FIXED: use req.json()

    // Check if product already exists in the user's cart
    const product = await CardProduct.findOne({
      productId,
      userId,
    });

    if (product) {
      return NextResponse.json(
        { message: "Product already exists in the cart" },
        { status: 400 }
      );
    }

    // Add new product to cart
    const newProduct = await CardProduct.create({
      productId,
      quantity,
      userId,
    });

    return NextResponse.json(
      {
        message: "Product added to cart successfully",
        item: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to add product to cart",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
