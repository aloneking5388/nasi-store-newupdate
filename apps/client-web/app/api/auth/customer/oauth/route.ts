import User from "@/models/User";
import { connectDB } from "@/utils/ConnectDB";
import { resolveCustomerType } from "@/utils/customerType";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/me";

async function verifyGoogleToken(token: string) {
  const res = await fetch(`${GOOGLE_TOKENINFO_URL}?id_token=${token}`);
  if (!res.ok) throw new Error("Invalid Google token");
  const data = await res.json();
  if (data.error) throw new Error("Invalid Google token");
  return {
    providerId: data.sub as string,
    email: data.email as string,
    name: (data.name || data.email) as string,
    profileImage: data.picture as string | undefined,
  };
}

async function verifyFacebookToken(token: string) {
  const res = await fetch(
    `${FACEBOOK_GRAPH_URL}?access_token=${token}&fields=id,name,email,picture`,
  );
  if (!res.ok) throw new Error("Invalid Facebook token");
  const data = await res.json();
  if (data.error)
    throw new Error(data.error.message || "Invalid Facebook token");
  if (!data.email)
    throw new Error("Facebook account must have a verified email");
  return {
    providerId: data.id as string,
    email: data.email as string,
    name: data.name as string,
    profileImage: data.picture?.data?.url as string | undefined,
  };
}

function makeJwt(user: any) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      customerType: resolveCustomerType(user),
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { provider, token } = await req.json();

    if (!["google", "facebook"].includes(provider)) {
      return NextResponse.json(
        { message: "Provider must be google or facebook" },
        { status: 400 },
      );
    }

    const providerData =
      provider === "google"
        ? await verifyGoogleToken(token)
        : await verifyFacebookToken(token);

    const { email, name, profileImage } = providerData;

    // Find existing user or create a new normal customer account
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: uuidv4(), // unusable random password — OAuth users login via provider only
        referralCode: uuidv4().slice(0, 8),
        profileImage,
        customerType: "normal",
        status: "active",
        invested: 0,
      });
    } else if (profileImage && !user.profileImage) {
      user.profileImage = profileImage;
      await user.save();
    }

    const jwtToken = makeJwt(user);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        customerType: resolveCustomerType(user),
        profileImage: user.profileImage,
      },
      token: jwtToken,
    });

    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "OAuth authentication failed" },
      { status: 400 },
    );
  }
}
