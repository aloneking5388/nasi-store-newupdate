import mongoose from "mongoose";
import CustomerWallet from "@/models/CustomerWallet";
import WalletTransaction from "@/models/WalletTransaction";
import { CustomerOrder } from "@/models/CustomerOrder";
import AuthorOrder from "@/models/AuthOrder";
import MyShopWallet from "@/models/MyShopWallet";
import SellerWallet from "@/models/SellerWallet";

export async function settleOrderPayment({
  orderId,
  walletAmount = 0,
  source,
  providerReference,
}: {
  orderId: string;
  walletAmount?: number;
  source: "wallet" | "momopay" | "stripe" | "paypal" | "razorpay" | "gpay";
  providerReference?: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  const orderObjectId = new mongoose.Types.ObjectId(orderId);
  const customerOrder = await CustomerOrder.findById(orderObjectId);
  if (!customerOrder) {
    throw new Error("Customer order not found");
  }

  if (customerOrder.payment_status === "paid") {
    return { alreadyPaid: true, message: "Order already marked as paid" };
  }

  const authorOrders = await AuthorOrder.find({
    $or: [{ orderId: orderObjectId }, { orderId: orderObjectId.toString() }],
  });

  if (!authorOrders.length) {
    throw new Error("Author orders not found");
  }

  const customerId = customerOrder.customerId?.toString?.();
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer on order");
  }

  if (walletAmount > 0) {
    const customerObjectId = new mongoose.Types.ObjectId(customerId);
    const wallet = await CustomerWallet.findOne({
      customerId: customerObjectId,
    });

    if (!wallet || wallet.amount < walletAmount) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.amount -= walletAmount;
    await wallet.save();

    await WalletTransaction.create({
      customerId: customerObjectId,
      type: "debit",
      amount: walletAmount,
      purpose: "Product purchase",
      orderId: orderObjectId,
      source,
      status: "success",
      providerReference,
    });
  }

  await CustomerOrder.findByIdAndUpdate(orderObjectId, {
    payment_status: "paid",
    delivery_status: "pending",
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  await MyShopWallet.create({ amount: customerOrder.price, month, year });

  for (const authorOrder of authorOrders) {
    if (!authorOrder.sellerId || !authorOrder.price) continue;

    await AuthorOrder.findByIdAndUpdate(authorOrder._id, {
      payment_status: "paid",
      delivery_status: "pending",
    });

    await SellerWallet.findOneAndUpdate(
      { sellerId: authorOrder.sellerId.toString(), month, year },
      { $inc: { amount: authorOrder.price } },
      { upsert: true, new: true },
    );
  }

  return { alreadyPaid: false, message: "Order paid successfully" };
}
