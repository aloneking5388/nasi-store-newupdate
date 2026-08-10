import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "seller",
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    payment: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
    method: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    shopInfo: {
      shopName: { type: String },
      division: { type: String },
      district: { type: String },
      sub_district: { type: String },
    },
  },
  { timestamps: true }
);

sellerSchema.index(
  { name: "text", email: "text" },
  { weights: { name: 5, email: 4 } }
);

// Prevent model overwrite issue in dev
const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;
