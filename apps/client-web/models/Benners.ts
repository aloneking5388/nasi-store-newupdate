import mongoose, { Document, Schema } from "mongoose";


export interface IBanner extends Document {
  productId: mongoose.Types.ObjectId;
  banner: string;
  link: string;
}

const bannerSchema = new Schema<IBanner>(
  {
    productId: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: "Product", 
    },
    banner: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Export the Banner model
const Banner =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", bannerSchema);
export default Banner;
