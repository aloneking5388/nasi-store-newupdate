"use client";
import { fetchBlogs } from "@/store/Blog/blogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

const Blog = () => {
  const dispatch = useAppDispatch();
  const { blogs } = useAppSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">📝 Latest Blogs</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <Link key={blog._id} href={`/blog/${blog.slug}`}>
            <div className="border rounded-md overflow-hidden shadow hover:shadow-lg transition">
              <Image
                src={blog.image}
                alt={blog.title}
                width={800}
                height={192}
                className="w-full h-48 object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{blog.title}</h3>
                <p className="text-sm text-gray-500">
                  By {blog.author} •{" "}
                  {new Date(blog.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
