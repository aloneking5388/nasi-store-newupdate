import Product from "@/models/Product";
import Review from "@/models/Review";
import { connectDB } from "@/utils/ConnectDB";
import mongoose from "mongoose";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await connectDB();

    const body = await req.json();
    const { name, review, rating, productId } = body;

     // ✅ Validate required fields
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: "Invalid or missing productId" },
      { status: 400 }
    );
  }

  if (!name || !review || typeof rating !== "number") {
    return NextResponse.json({ error: "Missing review data" }, { status: 400 });
  }

  try {
    // ✅ Create Review
    await Review.create({
      productId,
      name,
      rating,
      review,
      date: moment().format("LL"),
    });

    // ✅ Get all reviews for the product
    const reviews = await Review.find({ productId, rating: { $exists: true } });

    const totalRating = reviews.reduce(
      (acc, curr) => acc + (curr.rating || 0),
      0
    );

    let productRating = 0;
    if (reviews.length !== 0) {
      productRating = parseFloat((totalRating / reviews.length).toFixed(1));
    }

    // ✅ Update Product Rating
    await Product.findByIdAndUpdate(productId, { rating: productRating });

    return NextResponse.json({ message: "Review Success" }, { status: 200 });
  } catch (error: any) {
    console.error("Review submission failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}