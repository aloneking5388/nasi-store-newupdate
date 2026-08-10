import Review from "@/models/Review";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/utils/ConnectDB";

type RatingSummary = {
  rating: number;
  sum: number;
};

type AggregatedRating = {
  _id: number;
  count: number;
};

export async function GET( req: NextRequest) {
  await connectDB();
  const productId = req.nextUrl.pathname.split("/").pop(); // Extract productId from the URL
  const { searchParams } = new URL(req.nextUrl);

  const pageNo = parseInt(searchParams.get("pageNo") || "1");
  const limit = 5;
  const skipPage = limit * (pageNo - 1);
  const productObjectId = new ObjectId(productId);

  try {
    const getRating: AggregatedRating[] = await Review.aggregate([
      {
        $match: {
          productId: productObjectId,
          rating: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const rating_review: RatingSummary[] = [1, 2, 3, 4, 5]
      .map((r) => ({
        rating: r,
        sum: getRating.find((g) => g._id === r)?.count || 0,
      }))
      .reverse(); // optional: reverse for 5 to 1 display

    const [reviews, totalReview] = await Promise.all([
      Review.find({ productId: productObjectId })
        .skip(skipPage)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments({ productId: productObjectId }),
    ]);

    const totalPages = Math.ceil(totalReview / limit);

    return NextResponse.json(
      { reviews, totalReview, totalPages, currentPage: pageNo, rating_review },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
