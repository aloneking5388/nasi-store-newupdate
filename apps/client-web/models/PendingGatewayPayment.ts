import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IPendingGatewayPayment extends Document {
  customerId?: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  method: "momopay" | "stripe" | "paypal" | "razorpay" | "gpay";
  currencyCode: "UGX" | "INR" | "USD";
  gatewayAmount: number;
  walletAmount: number;
  status: "pending" | "paid" | "failed";
  providerSessionId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerReference?: string;
  expiresAt: Date;
}

const schema = new Schema<IPendingGatewayPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerOrder",
      required: true,
    },
    method: {
      type: String,
      enum: ["momopay", "stripe", "paypal", "razorpay", "gpay"],
      required: true,
    },
    currencyCode: {
      type: String,
      enum: ["UGX", "INR", "USD"],
      required: true,
    },
    gatewayAmount: { type: Number, required: true },
    walletAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    providerSessionId: { type: String },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    providerReference: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const PendingGatewayPayment =
  models.PendingGatewayPayment ||
  model<IPendingGatewayPayment>("PendingGatewayPayment", schema);

export default PendingGatewayPayment;
