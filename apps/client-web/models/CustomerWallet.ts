import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICustomerWallet extends Document {
  customerId: mongoose.Types.ObjectId; // Reference to Customer
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const customerWalletSchema = new Schema<ICustomerWallet>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);


const CustomerWallet =
  models.CustomerWallet || model<ICustomerWallet>('CustomerWallet', customerWalletSchema);

export default CustomerWallet;
