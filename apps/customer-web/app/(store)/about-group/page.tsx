import Link from "next/link";

const AboutGroup = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Team Reward System (Affiliate Program)
      </h1>

      <p className="mb-4">
        With our <strong>Team Reward System</strong>, you can earn not only from your own purchases 
        but also from the purchases made by people you refer. 
        Our affiliate model is fully transparent, structured, and compliant — 
        designed to reward genuine effort, not promises.
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>🧑‍🤝‍🧑 Invite friends and grow your network</li>
        <li>💸 Earn rewards from multiple levels of your team</li>
        <li>📊 Live dashboard for tracking your team and income</li>
        <li>🔒 100% transparent payout system with clear rules</li>
      </ul>

      <p className="mt-6">
        Learn more in your dashboard or{" "}
        <Link className="text-blue-600 underline" href="/join">
          start your earning journey now
        </Link>.
      </p>
    </div>
  );
};

export default AboutGroup;
