import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICustomerOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  products: Schema.Types.Mixed[]; 
  price: number;
  payment_status: string;
  shippingInfo: Record<string, any>; 
  delivery_status: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const customerOrderSchema = new Schema<ICustomerOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    products: {
      type: [Schema.Types.Mixed],
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
  {
    timestamps: true,
  }
);

export const CustomerOrder =
  models.CustomerOrder || model<ICustomerOrder>('CustomerOrder', customerOrderSchema);
