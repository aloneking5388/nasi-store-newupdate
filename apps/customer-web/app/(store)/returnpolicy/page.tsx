import React from "react";

const ReturnPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Return & Refund Policy
      </h1>

      <p className="mb-4">
        At <strong>NasiStore</strong>, customer satisfaction is our top priority. We understand that sometimes things don’t go as expected — and we’re here to help.
        This Return & Refund Policy outlines the conditions under which returns and refunds can be made.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">1. Return Eligibility</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Returns must be requested within <strong>3 calendar days</strong> from the date of delivery.</li>
        <li>The product must be in its original condition — unused, unwashed, and with original packaging intact.</li>
        <li>Digital or downloadable products (e.g., codes, eBooks) are <strong>not eligible</strong> for return or refund.</li>
        <li>Perishable goods, hygiene-sensitive items, or clearance sales are also not returnable unless proven defective.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">2. How to Initiate a Return</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Log in to your NasiStore account and go to the <strong>My Orders</strong> section.</li>
        <li>Click on the product you want to return and tap “Request Return”.</li>
        <li>Provide a clear reason and, if possible, upload a photo of the item (in case of defect/damage).</li>
        <li>Your return request will be reviewed by our team and the respective seller within 48 hours.</li>
      </ol>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">3. Seller Verification Process</h2>
      <p>
        All return requests go through a verification process by the seller. Only after the seller verifies the issue,
        the return will be approved. If the seller fails to respond in 48 hours, our team will step in to resolve the issue.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">4. Refund Timelines</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Once the return is approved, you will receive a refund within <strong>3–7 business days</strong>.</li>
        <li>Refunds will be credited back to your <strong>NasiWallet</strong>, which you can use for future purchases or withdraw.</li>
        <li>If the payment was made via card or mobile money, refund may be processed through the same method (where applicable).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">5. Important Notes</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Repeated abuse of return policy may lead to account restrictions or permanent suspension.</li>
        <li>For group orders under the MLM system, only the primary buyer can initiate a return.</li>
        <li>If the item is damaged during return shipping due to improper packaging, refund may be partially or fully denied.</li>
        <li>NasiStore reserves the right to update this policy at any time to ensure fairness for both customers and sellers.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">6. Need Help?</h2>
      <p>
        If you have any questions or issues with your return, please contact our support team at{" "}
        <a href="mailto:support@nasistore.com" className="text-blue-600 underline">
          support@nasistore.com
        </a>{" "}
        or reach us via live chat during working hours.
      </p>

      <p className="mt-8 text-sm text-gray-500 text-center">
        Last updated: July 7, 2025
      </p>
    </div>
  );
};

export default ReturnPolicy;
