import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISellerWallet extends Document {
  sellerId: mongoose.Types.ObjectId; // Reference to Seller
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const sellerWalletSchema = new Schema<ISellerWallet>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const SellerWallet =
  models.SellerWallet || model<ISellerWallet>('SellerWallet', sellerWalletSchema);

export default SellerWallet;
