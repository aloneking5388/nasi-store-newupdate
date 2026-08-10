import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICardProduct extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CardProductSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Optional reference
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product', // Optional reference
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CardProduct: Model<ICardProduct> =
  mongoose.models.CardProduct || mongoose.model<ICardProduct>('CardProduct', CardProductSchema);

export default CardProduct;
