import React from "react";

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        About NasiStore
      </h1>

      <p className="text-lg mb-4 leading-relaxed">
        Welcome to <strong>NasiStore</strong> – a platform by{" "}
        <span className="text-primary font-semibold">Nasi Digital Pvt. Ltd.</span>  
        that blends <span className="text-primary font-semibold">eCommerce, Wallet,</span> and{" "}
        <span className="text-primary font-semibold">Affiliate Reward</span> systems  
        to empower customers, sellers, and communities.  
        We’re more than just a store — we’re building opportunities.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">🌍 Our Mission</h2>
      <p className="mb-4">
        Our mission is simple yet powerful — to provide the same products at the same price  
        to everyone, no matter where they live.  
        We believe everyone deserves fair pricing, fast delivery, and the opportunity to grow financially through our reward system.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">💡 What Makes Us Unique?</h2>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>🛍️ A trusted multi-vendor eCommerce platform</li>
        <li>💸 Integrated wallet for secure payments and cashback</li>
        <li>🤝 Transparent affiliate reward program that encourages community growth</li>
        <li>📦 Nationwide delivery — same product, same price, everywhere</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">❤️ Giving Back to the Community</h2>
      <p className="mb-4">
        NasiStore is built with people in mind. A percentage of every transaction  
        supports meaningful causes, including:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>📚 Free education for underprivileged children</li>
        <li>🏥 Free medical support for those who need it most</li>
      </ul>
      <p className="mb-4">
        By shopping or participating in our reward program, you’re not just earning for yourself —  
        you’re helping us build a better and stronger future.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">📍 Powered by Nasi Digital Pvt. Ltd.</h2>
      <p className="mb-4">
        Founded in India, NasiStore aims to expand globally — beginning from Uganda,  
        reaching every city, town, and village with trust and transparency.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">📞 Contact Us</h2>
      <p className="mb-4">
        Have questions, feedback, or collaboration ideas? Reach out to us at:{" "}
        <a href="mailto:support@nasistore.com" className="text-blue-600 underline">
          support@nasistore.com
        </a>
      </p>

      <div className="text-center mt-10">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Nasi Digital Pvt. Ltd. — Empowering People, Empowering Change.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
