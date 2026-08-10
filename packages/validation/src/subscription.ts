import User from "@/models/User";
import { SUBSCRIPTION_JOINING_FEE } from "@nasi/constants/subscription";

export async function validateSubscriptionEntry(
  referralCode?: string,
  joiningFee?: number,
) {
  const normalizedReferralCode = referralCode?.trim() || "";

  if (!normalizedReferralCode) {
    throw new Error("Referral code is required");
  }

  if (joiningFee !== SUBSCRIPTION_JOINING_FEE) {
    throw new Error(`Joining fee must be UGX ${SUBSCRIPTION_JOINING_FEE}`);
  }

  const referrer = await User.findOne({ referralCode: normalizedReferralCode });

  if (!referrer) {
    throw new Error("Invalid referral code");
  }

  if (referrer.referralCount >= 3) {
    throw new Error("Referral limit reached. Cannot refer more than 3 users.");
  }

  return referrer;
}
