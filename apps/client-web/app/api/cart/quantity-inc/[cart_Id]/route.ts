import CardProduct from "@/models/Card";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  await connectDB();

  const cart_Id = req.nextUrl.pathname.split("/").pop(); // Extract cart_Id from the URL

  try {
    const product = await CardProduct.findById(cart_Id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = await CardProduct.findByIdAndUpdate(
      cart_Id,
      { $inc: { quantity: 1 } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Product quantity increased", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
