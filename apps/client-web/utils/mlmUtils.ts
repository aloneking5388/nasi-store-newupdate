import User from "@/models/User";
import { Types } from "mongoose";

export async function assignUplines(
newUserId: Types.ObjectId, referrerId: Types.ObjectId) {
  const uplines: Types.ObjectId[] = [];
  let currentReferrerId = referrerId;

  while (currentReferrerId && uplines.length < 10) {
    const referrer = await User.findById(currentReferrerId);
    if (!referrer) break;

    uplines.push(referrer._id);
    currentReferrerId = referrer.referredBy as Types.ObjectId;
  }

  await User.findByIdAndUpdate(newUserId, { uplines });
}

export async function getTotalActiveDownlineCount(
  userId: Types.ObjectId
): Promise<number> {
  const user = await User.findById(userId);
  if (!user || user.downline.length === 0) return 0;

  const activeDownlines = await User.find({
    _id: { $in: user.downline },
    status: "active",
  });

  let totalCount = activeDownlines.length;

  for (const downlineUser of activeDownlines) {
    totalCount += await getTotalActiveDownlineCount(downlineUser._id);
  }

  return totalCount;
}

export async function calculateLevel(activeDownlineCount: number) {
  const cumulativeMatrix = [
    3, 12, 39, 120, 363, 1092, 3279, 9840, 29523, 88572,
  ];
  let level = 0;
  for (let i = 0; i < cumulativeMatrix.length; i++) {
    if (activeDownlineCount >= cumulativeMatrix[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

const uplineBonusMap: Record<number, number> = {
  0: 500,
  2: 500,
  4: 500,
  6: 500,
  8: 500,
};

export async function handleLevelUpgradeAndBonus(user: any) {
  const activeDownlineCount = await getTotalActiveDownlineCount(user._id);
  const newLevel = await calculateLevel(activeDownlineCount);

  if (newLevel > user.level) {
    const previousLevel = user.level;
    user.level = newLevel;

    if (previousLevel === 0 && newLevel >= 1) {
      user.earnings += 1500;
    }

    await user.save();

    await checkUplineForBonus(user, previousLevel, newLevel);
  }
}

export async function checkUplineForBonus(
  user: any,
  oldLevel = 0,
  newLevel = 0
) {
  if (!user?.referredBy) return;

  const parent = await User.findById(user.referredBy).populate("downline");

  if (!parent) return;

  const activeReferrals = await User.countDocuments({
    _id: { $in: parent.downline },
    status: "active",
  });

  parent.referralCount = activeReferrals;
  await parent.save();

  if (newLevel > oldLevel) {
    for (const [indexStr, bonus] of Object.entries(uplineBonusMap)) {
      const index = parseInt(indexStr);
      const uplineId = user.uplines?.[index];

      if (!uplineId) continue;

      const upline = await User.findById(uplineId);
      if (!upline) continue;

      if (upline.bonusesGiven?.includes(user._id)) continue;

      upline.earnings += bonus;
      upline.bonusesGiven = [...(upline.bonusesGiven || []), user._id];
      await upline.save();
    }

    await handleLevelUpgradeAndBonus(parent);
  }
}
