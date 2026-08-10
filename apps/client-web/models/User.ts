import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  referralCode: string;
  referredBy?: Types.ObjectId | null;
  profileImage?: string;
  downline: Types.ObjectId[];
  uplines: Types.ObjectId[];
  bonusesGiven: Types.ObjectId[];
  shippingInfo: {
    address?: string;
    post: string;
    province?: string;
    city?: string;
    area?: string;
  };
  level: number;
  referralCount: number;
  earnings: number;
  invested: number;
  customerType: "normal" | "subscription";
  role: "user" | "seller" | "admin";
  status: "pending" | "active" | "suspended";
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows for unique phone numbers but can be null
    },
    shippingInfo: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      phone: {
        type: String,
      },
      post: {
        type: String,
      },
      province: {
        type: String,
      },
      city: {
        type: String,
      },
      area: {
        type: String,
      },
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    downline: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    uplines: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bonusesGiven: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImage: {
      type: String,
    },
    level: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    invested: {
      type: Number,
      default: 0,
    },
    customerType: {
      type: String,
      enum: ["normal", "subscription"],
      default: "normal",
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserSchema.index(
  { name: "text", email: "text" },
  { weights: { name: 5, email: 4 } },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
