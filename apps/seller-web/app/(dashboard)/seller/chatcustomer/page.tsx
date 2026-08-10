"use client";

import LiveChatPanel from "@/components/StoreComponents/LiveChatPanel";

const SellerChatCustomerPage = () => {
  return (
    <LiveChatPanel
      type="customer_seller"
      title="Chat with Customers"
      subtitle="Live seller and customer conversation."
    />
  );
};

export default SellerChatCustomerPage;
