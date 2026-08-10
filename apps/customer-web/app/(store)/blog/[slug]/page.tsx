"use client";
import { fetchBlogBySlug } from "@/store/Blog/blogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { selectedBlog: blog } = useAppSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogBySlug(slug) as any);
  }, [slug, dispatch]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl max-auto py-10 px-4">
      <Image
        src={blog.image}
        alt={blog.title}
        width={1024}
        height={400}
        className="w-full h-64 object-cover rounded mb-6"
        sizes="100vw"
        priority
      />
      <h1 className="text-3xl font-bold mb-3">{blog.title}</h1>
      <p className="text-gray-500 mb-6">
        By {blog.author} on{" "}
        {new Date(blog.createdAt ?? "").toLocaleDateString()}
      </p>
      <div
        dangerouslySetInnerHTML={{ __html: blog.content }}
        className="prose"
      />
    </div>
  );
};

export default BlogDetail;
