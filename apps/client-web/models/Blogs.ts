import mongoose, { Schema, Document } from "mongoose";

export interface Blog extends Document {
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  createdAt?: Date;
}

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Blogs = mongoose.models.Blog || mongoose.model<Blog>("Blog", blogSchema);

export default Blogs;
