import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

CategorySchema.index({
  name: "text",
  subcategories: "text",
  image: "text",
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
