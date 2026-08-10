const AboutShops = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        About Shops on NasiStore
      </h1>
      <p className="text-lg mb-4 leading-relaxed">
        NasiStore is a home for Uganda’s sellers, entrepreneurs, and businesses.
        Our platform empowers vendors to create their own digital shop, upload products, and sell directly to customers across Uganda.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>🛒 Free vendor registration</li>
        <li>📈 Real-time order management</li>
        <li>💰 Instant wallet payout system</li>
        <li>🎯 Reach customers nationwide</li>
      </ul>
      <p className="mt-6">Want to become a seller? <a className="text-blue-600 underline" href="/register/seller">Join Now</a></p>
    </div>
  );
};
export default AboutShops;
