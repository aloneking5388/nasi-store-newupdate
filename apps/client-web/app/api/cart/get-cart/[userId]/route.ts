import CardProduct from "@/models/Card";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const co = 5; // commission %
    const userId = req.nextUrl.pathname.split("/").pop(); // Extract userId from the URL

    const cartItems = await CardProduct.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "products",
        },
      },
    ]);

    let buyProductItem = 0;
    let calculatedPrice = 0;
    let cardProductCount = 0;

    const outOfStockProduct = cartItems.filter(
      (p) => p.products[0]?.stock < p.quantity
    );

    for (const item of outOfStockProduct) {
      cardProductCount += item.quantity;
    }

    const stockProduct = cartItems.filter(
      (p) => p.products[0]?.stock >= p.quantity
    );

    for (const item of stockProduct) {
      const { quantity } = item;
      const product = item.products[0];
      const { price, discount } = product;

      cardProductCount += quantity;
      buyProductItem += quantity;

      if (discount !== 0) {
        calculatedPrice += quantity * (price - Math.floor((price * discount) / 100));
      } else {
        calculatedPrice += quantity * price;
      }
    }

    let p: any = {};
    for (const item of stockProduct) {
      const tempProduct = item.products[0];
      const sellerId = tempProduct.sellerId.toString();

      let pri = tempProduct.discount
        ? tempProduct.price - Math.floor((tempProduct.price * tempProduct.discount) / 100)
        : tempProduct.price;

      pri = pri - Math.floor((pri * co) / 100);
      const itemTotal = pri * item.quantity;

      if (!p[sellerId]) {
        p[sellerId] = {
          sellerId,
          shopName: tempProduct.shopName,
          price: itemTotal,
          products: [
            {
              _id: item._id,
              quantity: item.quantity,
              productInfo: tempProduct,
            },
          ],
        };
      } else {
        p[sellerId].price += itemTotal;
        p[sellerId].products.push({
          _id: item._id,
          quantity: item.quantity,
          productInfo: tempProduct,
        });
      }
    }

    const sellersData = Object.values(p);

    const taxRate = 18;

    const taxAmount = Math.floor((calculatedPrice * taxRate) / 100);

    const totalWithTax = calculatedPrice + taxAmount;

    return NextResponse.json(
      {
        cartItems: sellersData,
        buyProductItem,
        price: calculatedPrice,
        tax: taxAmount,
        totalWithTax,
        cardProductCount,
        outOfStockProducts: outOfStockProduct,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "get-card product failed" }, { status: 500 });
  }
}
