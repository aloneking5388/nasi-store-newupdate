const AboutDelivery = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Our Delivery Promise
      </h1>

      <p className="mb-4">
        <strong>NasiStore</strong> ensures every order — big or small — reaches you safely and on time.
        We’re building a delivery network that connects East Africa’s cities and villages under one trusted system.
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>🚚 <strong>Fast city delivery:</strong> 1–3 days within major cities</li>
        <li>📦 <strong>Rural reach:</strong> 2–5 days with complete tracking support</li>
        <li>🔄 <strong>Easy returns & replacements:</strong> hassle-free process</li>
        <li>🛡️ <strong>Verified delivery partners:</strong> ensuring product safety</li>
      </ul>

      <p className="mt-6 leading-relaxed">
        We’re continuously improving our logistics to make sure that distance never limits access.
        Whether you’re in Kampala or a remote area, our promise remains the same —{" "}
        <span className="text-primary font-semibold">quality products delivered with care.</span>
      </p>

      <p className="mt-6">
        For delivery inquiries, contact us at{" "}
        <a
          className="text-blue-600 underline"
          href="mailto:delivery@nasistore.com"
        >
          delivery@nasistore.com
        </a>
      </p>

      <div className="text-center mt-10">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Nasi Digital Pvt Ltd India — Building Connected Commerce Across East Africa.
        </p>
      </div>
    </div>
  );
};

export default AboutDelivery;
