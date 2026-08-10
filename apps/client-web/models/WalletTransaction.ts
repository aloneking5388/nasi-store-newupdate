import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWalletTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  purpose: string;
  orderId?: mongoose.Types.ObjectId | null;
  source: "earning" | "manual_topup" | "purchase" | "withdrawal";
  status: "pending" | "success" | "failed";
  createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerOrder",
      default: null,
    },
    source: {
      type: String,
      enum: ["earning", "manual_topup", "purchase", "withdrawal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false, // optional: to remove `__v` from Mongo docs
  }
);

const WalletTransaction =
  models.WalletTransaction ||
  model<IWalletTransaction>("WalletTransaction", walletTransactionSchema);

export default WalletTransaction;
