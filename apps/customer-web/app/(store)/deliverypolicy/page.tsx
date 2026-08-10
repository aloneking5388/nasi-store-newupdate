import React from "react";

const DeliveryPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Delivery Policy
      </h1>

      <p className="mb-4">
        At <strong>NasiStore</strong>, we are committed to delivering your orders across India — quickly, safely, and affordably. Below you’ll find important details about our delivery coverage, timelines, and charges.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">1. Delivery Coverage</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>We deliver to all major cities and towns across India.</li>
        <li>Some remote or rural areas may have slightly longer delivery timelines.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">2. Delivery Charges</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Orders <strong>above ₹999</strong> qualify for <span className="text-green-600 font-medium">free delivery</span> (within 10 km radius).</li>
        <li>Orders below ₹999 will be charged based on distance:</li>
        <ul className="list-disc pl-10 mt-1">
          <li><strong>₹20</strong> per 5 kilometers of delivery distance.</li>
          <li>For example, a 15 km delivery would cost ₹60.</li>
        </ul>
        <li>Delivery fees are automatically calculated at checkout based on your location.</li>
        <li>Cash on Delivery (COD) orders may include a small handling fee depending on the area.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">3. Delivery Timelines</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Most deliveries within city limits arrive in <strong>1–3 business days</strong>.</li>
        <li>Deliveries to rural or remote areas may take <strong>3–6 business days</strong>.</li>
        <li>Orders placed on Sundays or public holidays are processed on the next working day.</li>
        <li>You’ll receive tracking updates via SMS or email once your order is shipped.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">4. Delivery Partners & Tracking</h2>
      <p>
        We collaborate with trusted courier partners like Delhivery, BlueDart, and India Post to ensure secure and timely delivery. You’ll receive a tracking link via email/SMS once your parcel is dispatched.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">5. Failed or Delayed Deliveries</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>If a delivery fails due to an incorrect address or unavailable recipient, we’ll attempt redelivery up to 2 more times.</li>
        <li>If all attempts fail, the order will be returned to the seller and a delivery fee may still apply.</li>
        <li>In rare cases of delay (e.g., weather, logistics, or festivals), our support team will notify you immediately.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">6. Need Help?</h2>
      <p>
        For any delivery-related assistance, please contact our support team at{" "}
        <a href="mailto:support@nasistore.com" className="text-blue-600 underline">
          support@nasistore.com
        </a>{" "}
        or call us at +91-6356001885.
      </p>

      <p className="mt-8 text-sm text-gray-500 text-center">
        Last updated: October 7, 2025
      </p>
    </div>
  );
};

export default DeliveryPolicy;
