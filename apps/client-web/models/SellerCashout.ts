import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISellerCashout extends Document {
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const sellerCashoutSchema = new Schema<ISellerCashout>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const SellerCashout =
  models.SellerCashout ||
  model<ISellerCashout>("SellerCashout", sellerCashoutSchema);

export default SellerCashout;
