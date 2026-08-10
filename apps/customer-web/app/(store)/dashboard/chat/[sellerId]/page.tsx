"use client";

import { use } from "react";
import LiveChatPanel from "@/components/StoreComponents/LiveChatPanel";

const CustomerSellerChatBySellerPage = ({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) => {
  const { sellerId } = use(params);

  return (
    <LiveChatPanel
      type="customer_seller"
      initialPeerId={sellerId}
      title="Chat with Seller"
      subtitle="Live conversation with your seller."
    />
  );
};

export default CustomerSellerChatBySellerPage;
