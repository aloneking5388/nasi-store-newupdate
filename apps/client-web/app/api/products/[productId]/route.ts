// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";
import { verifyToken } from "@/lib/auth";
import { getTokenFromHeaders } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.pathname.split("/").pop(); // Extract productId from the URL

    await connectDB();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const productId = req.nextUrl.pathname.split("/").pop(); // Extract productId from the URL
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const parseArray = (value: unknown) => {
      if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
      }

      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [];
    };

    const updatePayload = {
      name: body.name,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory || "",
      discount: body.discount,
      price: body.price,
      brand: body.brand,
      stock: body.stock,
      sizes: parseArray(body.sizes),
      colors: parseArray(body.colors),
      sellerId: user.id,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatePayload,
      {
        new: true,
      },
    );

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = req.nextUrl.pathname.split("/").pop(); // Extract productId from the URL
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
