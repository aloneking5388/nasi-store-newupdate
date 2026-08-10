import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  review: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    review: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite issue in Next.js 15
const Review = models.Review || model<IReview>("Review", reviewSchema);

export default Review;
