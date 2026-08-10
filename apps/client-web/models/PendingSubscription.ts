import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IPendingSubscription extends Document {
  customerId: mongoose.Types.ObjectId;
  referralCode: string;
  momoReferenceId: string;
  phone: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  expiresAt: Date;
}

const schema = new Schema<IPendingSubscription>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referralCode: { type: String, required: true },
    momoReferenceId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const PendingSubscription =
  models.PendingSubscription ||
  model<IPendingSubscription>("PendingSubscription", schema);

export default PendingSubscription;
