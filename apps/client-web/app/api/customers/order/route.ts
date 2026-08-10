import AuthorOrder from "@/models/AuthOrder";
import CardProduct from "@/models/Card";
import { CustomerOrder } from "@/models/CustomerOrder";
import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const {
    price,
    products,
    shippingFee: _shippingFeeFromClient, // ignore this
    shippingInfo,
    userId,
    shippingMethodMap,
  } = body;

  let authorOrderData = [];
  let cardId = [];
  const tempDate = new Date();

  const user = await User.findById(userId);
  if (user && shippingInfo) {
    user.shippingInfo = { ...user.shippingInfo, ...shippingInfo };
    user.markModified("shippingInfo");
    await user.save();
  }

  let customerOrderProduct = [];

  for (let i = 0; i < products.length; i++) {
    const pro = products[i].products;
    for (let j = 0; j < pro.length; j++) {
      let tempCusPro = pro[j].productInfo;
      tempCusPro.quantity = pro[j].quantity;
      customerOrderProduct.push(tempCusPro);
      if (pro[j]._id) {
        cardId.push(pro[j]._id);
      }
    }
  }

  // ✅ Step 1: Calculate shipping fee dynamically
  // ✅ Improved per-seller conditional shipping logic
  let calculatedShippingFee = 0;
  for (let i = 0; i < products.length; i++) {
    const sellerId = products[i].sellerId;
    const method = shippingMethodMap?.[sellerId];
    const sellerPrice = products[i].price;

    if (method === "home delivery" && sellerPrice < 50000) {
      calculatedShippingFee += 1000;
    }
  }

  try {
    // ✅ Step 2: Create Customer Order with calculated fee
    const order = await CustomerOrder.create({
      customerId: userId,
      shippingInfo,
      products: customerOrderProduct,
      price: price + calculatedShippingFee,
      delivery_status: "pending",
      payment_status: "unpaid",
      date: tempDate,
    });

    // ✅ Step 3: Create seller (Author) orders
    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      const pri = products[i].price;
      const sellerId = products[i].sellerId;
      const shippingMethod = shippingMethodMap?.[sellerId] || "home delivery";

      let storePro = [];
      for (let j = 0; j < pro.length; j++) {
        storePro.push({
          productId: pro[j].productInfo._id,
          name: pro[j].productInfo.name,
          price: pro[j].productInfo.price,
          quantity: pro[j].quantity,
          images: pro[j].productInfo.images[0],
          brand: pro[j].productInfo.brand,
        });
      }

      authorOrderData.push({
        orderId: order.id,
        sellerId,
        products: storePro,
        price: pri,
        payment_status: "unpaid",
        shippingInfo: JSON.stringify(shippingInfo),
        delivery_status: "pending",
        date: tempDate,
        shippingMethod, // ✅ Store shipping method
      });
    }

    await AuthorOrder.insertMany(authorOrderData);

    for (let k = 0; k < cardId.length; k++) {
      await CardProduct.findByIdAndDelete(cardId[k]);
    }

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: order.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
