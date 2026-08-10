import { verifyToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Blogs from "@/models/Blogs";
import { connectDB } from "@/utils/ConnectDB";
import { generateSlug } from "@/utils/generateSlug";
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File;

    if (!title || !content || !image) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const imageBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Upload to Cloudinary
    const cloudinaryResponse = (await uploadToCloudinary(
      buffer,
      "nasi-store-blogs"
    )) as { secure_url: string };

    const slug = generateSlug(title);

    // Create blog in DB
    const newBlog = await Blogs.create({
      title,
      slug,
      content,
      image: cloudinaryResponse.secure_url,
      author: user.name, // ✅ Fixed typo "athor" -> "author"
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog: newBlog },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const blogs = await Blogs.find({});

    const totalBlogs = await Blogs.countDocuments();

    return NextResponse.json(
      { blogs, totalBlogs },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
    
  }
}
