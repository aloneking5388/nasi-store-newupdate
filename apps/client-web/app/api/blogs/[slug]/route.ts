import Blogs from "@/models/Blogs";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const url = req.nextUrl;
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return NextResponse.json({ error: "Slug not found" }, { status: 400 });
    }

    const blog = await Blogs.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
