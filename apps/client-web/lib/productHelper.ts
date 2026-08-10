import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";

/**
 * Fetches up to 20 products added in the last 7 days.
 */
export const getRecentProducts = async () => {
  await connectDB();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    const products = await Product.find({
      createdAt: { $gte: oneWeekAgo },
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name price category images");

    return products || [];
  } catch (error) {
    console.error("Error fetching recent products:", error);
    return [];
  }
};
