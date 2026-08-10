import mongoose, { Schema, Document, model, models } from "mongoose";

interface ProductItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  brand: string;
  images: string[]; // plural
}


export interface IAuthorOrder extends Document {
  orderId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  products: ProductItem[];
  price: number;
  shippingMethod: string;
  payment_status: string;
  shippingInfo: string;
  delivery_status: string;
  date: string; // or Date if you want
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthorOrder>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "CustomerOrder",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    products: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          brand: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true,
          },
          images: {
            type: [String],
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      required: true,
    },
    shippingMethod: {
      type: String,
      required: true,
      enum: ["home delivery", "pickup"],
    },
    shippingInfo: {
      type: Schema.Types.Mixed,
      required: true,
    },
    delivery_status: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AuthorOrder =
  models.AuthorOrder || model<IAuthorOrder>("AuthorOrder", authorSchema);

export default AuthorOrder;
