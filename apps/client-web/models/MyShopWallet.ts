import { Schema, Document, model, models } from 'mongoose';

export interface IMyShopWallet extends Document {
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const myShopWalletSchema = new Schema<IMyShopWallet>(
  {
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

const MyShopWallet =
  models.MyShopWallet || model<IMyShopWallet>('MyShopWallet', myShopWalletSchema);

export default MyShopWallet;
