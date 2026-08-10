import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  discount: number;
  image: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // <-- Relation to User model
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product', // <-- Relation to Product model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
