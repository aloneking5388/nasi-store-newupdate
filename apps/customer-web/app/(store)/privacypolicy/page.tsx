import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-center text-primary mb-8">
        Privacy Policy
      </h1>

      <p className="mb-6">
        At <strong>NasiStore</strong>, a product of{" "}
        <strong>Nasi Digital Pvt. Ltd. (India)</strong>, your privacy is extremely
        important to us. This Privacy Policy explains how we collect, use,
        protect, and share your personal information when you visit or use our
        website or mobile application. We comply with India’s{" "}
        <strong>Information Technology (Reasonable Security Practices and
        Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>{" "}
        and global data protection standards.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        1. Information We Collect
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Personal Info:</strong> Name, email address, phone number,
          billing and delivery addresses.
        </li>
        <li>
          <strong>Wallet Info:</strong> Transactions, balances, reward earnings,
          and withdrawal requests.
        </li>
        <li>
          <strong>Referral & Reward Data:</strong> Your referral code, referred
          users, and team reward history.
        </li>
        <li>
          <strong>Device Info:</strong> IP address, browser type, mobile device
          data, operating system.
        </li>
        <li>
          <strong>Usage Info:</strong> Pages visited, session duration, clicks,
          and interactions.
        </li>
        <li>
          <strong>Payment Info:</strong> Payment method, transaction ID, but we{" "}
          <strong>never</strong> store card details directly.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To deliver your orders and manage transactions securely</li>
        <li>To maintain your wallet and referral reward accounts</li>
        <li>To verify identity and prevent unauthorized access</li>
        <li>To send order updates, offers, and important notices</li>
        <li>To analyze usage and improve platform performance</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        3. Data Sharing & Disclosure
      </h2>
      <p>We never sell or rent your data. We may share it only when necessary:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>With delivery partners for shipping and logistics</li>
        <li>
          With payment gateways (Razorpay, Stripe, PayPal) for secure
          transactions
        </li>
        <li>With analytics and performance tools (like Google Analytics)</li>
        <li>With government or legal authorities if required by law</li>
        <li>
          With referral partners (only anonymized data, not personal details)
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        4. Cookies & Tracking
      </h2>
      <p>We use cookies to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Maintain login sessions and preferences</li>
        <li>Understand user behavior and improve user experience</li>
        <li>Show personalized content and product recommendations</li>
      </ul>
      <p className="mt-2">
        You can disable cookies anytime in your browser settings, though some
        features may not function properly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        5. Data Security
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Data is stored on secure servers with encryption and firewalls</li>
        <li>Passwords are encrypted and never stored in plain text</li>
        <li>Payment data is processed only by verified third-party gateways</li>
        <li>Access to data is limited to authorized personnel only</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        6. Your Rights
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>✅ Right to access or correct your personal data</li>
        <li>✅ Right to delete your account and wallet info</li>
        <li>✅ Right to opt out of marketing communications</li>
        <li>✅ Right to request data portability</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        7. Children’s Privacy
      </h2>
      <p>
        Our services are not meant for users below 13 years of age. We do not
        knowingly collect data from minors. If you believe such data was shared,
        contact us for immediate deletion.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        8. Policy Updates
      </h2>
      <p>
        This policy may be revised periodically. Users will be notified via
        email or platform notifications. Please review this page regularly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3 text-primary">
        9. Contact Us
      </h2>
      <p>
        For any queries or privacy requests, reach out to:
      </p>
      <p className="mt-2">
        📧{" "}
        <a
          href="mailto:privacy@nasidigital.in"
          className="text-blue-600 underline"
        >
          privacy@nasidigital.in
        </a>
      </p>
      <p>📞 +91-6356001885</p>
      <p>🏢 Nasi Digital Pvt. Ltd., kangawai Navsari, Gujarat, 396560 India</p>

      <p className="text-sm text-gray-500 text-center mt-12">
        Last updated: October 7, 2025
      </p>
    </div>
  );
};

export default PrivacyPolicy;
