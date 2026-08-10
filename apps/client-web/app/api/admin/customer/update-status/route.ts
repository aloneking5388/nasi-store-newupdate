import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import { checkUplineForBonus, handleLevelUpgradeAndBonus } from "@/utils/mlmUtils";
import { getTokenFromHeaders } from "@/utils/getToken";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
  
    const token = getTokenFromHeaders(req.headers);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, status } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        {
          status: 404,
        }
      );
    }

    user.status = status;
    await user.save();

    if (status === "active" && user.referredBy) {
      const referrer = await User.findById(user.referredBy).populate(
        "downline"
      );

      if (referrer) {
        const activeDownlineCount = await User.countDocuments({
          _id: { $in: referrer.downline },
          status: "active",
        });

        referrer.referralCount = referrer.downline.length;
        await referrer.save();

        if (activeDownlineCount >= 3) {
          await handleLevelUpgradeAndBonus(referrer);
          await checkUplineForBonus(referrer);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      status: user.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error updating user status: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
