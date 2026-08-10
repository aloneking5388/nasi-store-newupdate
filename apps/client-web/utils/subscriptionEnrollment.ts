import User, { IUser } from "@/models/User";
import { assignUplines } from "@/utils/mlmUtils";
import { SUBSCRIPTION_JOINING_FEE } from "@nasi/constants/subscription";
export { validateSubscriptionEntry } from "@nasi/validation/subscription";

export async function applySubscriptionEnrollment(
  user: IUser,
  referrer: IUser,
) {
  user.customerType = "subscription";
  user.referredBy = referrer._id;
  user.invested = SUBSCRIPTION_JOINING_FEE;
  user.status = "pending";
  await user.save();

  const alreadyInDownline = referrer.downline.some(
    (entry) => String(entry) === String(user._id),
  );

  if (!alreadyInDownline) {
    referrer.downline.push(user._id);
  }

  referrer.referralCount += alreadyInDownline ? 0 : 1;
  await referrer.save();

  await assignUplines(user._id, referrer._id);
}
