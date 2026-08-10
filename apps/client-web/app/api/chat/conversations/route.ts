import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/ConnectDB";
import ChatConversation, {
  ChatConversationType,
} from "@/models/ChatConversation";
import User from "@/models/User";
import Seller from "@/models/Seller";
import Admin from "@/models/Admin";
import { getChatUserFromHeaders } from "@/lib/chatAuth";
import { Server as SocketIOServer } from "socket.io";

interface ConversationParticipant {
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
}

const mapConversation = (conversation: any) => ({
  id: conversation._id.toString(),
  type: conversation.type,
  customerId: conversation.customerId,
  sellerId: conversation.sellerId,
  adminId: conversation.adminId,
  participants: (conversation.participants || []).map((p: any) => ({
    userId: String(p.userId),
    role: p.role,
    name: p.name,
    profileImage: p.profileImage || "",
  })),
  unreadForCustomer: conversation.unreadForCustomer || 0,
  unreadForSeller: conversation.unreadForSeller || 0,
  unreadForAdmin: conversation.unreadForAdmin || 0,
  lastMessage: conversation.lastMessage || "",
  lastMessageAt: conversation.lastMessageAt,
  updatedAt: conversation.updatedAt,
});

const findParticipantForPeer = async (
  role: "user" | "seller" | "admin",
  peerId?: string,
): Promise<ConversationParticipant | null> => {
  if (role === "admin") {
    const admin = peerId
      ? await Admin.findById(peerId)
      : await Admin.findOne({});
    if (!admin) return null;
    return {
      userId: admin._id.toString(),
      role: "admin",
      name: admin.name,
      profileImage: admin.profileImage || "",
    };
  }

  if (!peerId) return null;

  if (role === "seller") {
    const seller = await Seller.findById(peerId);
    if (!seller) return null;
    return {
      userId: seller._id.toString(),
      role: "seller",
      name: seller.name,
      profileImage: seller.profileImage || "",
    };
  }

  const user = await User.findById(peerId);
  if (!user) return null;
  return {
    userId: user._id.toString(),
    role: "user",
    name: user.name,
    profileImage: user.profileImage || "",
  };
};

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const authUser = getChatUserFromHeaders(req.headers);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const type = (req.nextUrl.searchParams.get("type") ||
      "") as ChatConversationType;
    if (!type || !["customer_seller", "seller_admin"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid conversation type" },
        { status: 400 },
      );
    }

    const query: Record<string, string> = { type };

    if (type === "customer_seller") {
      if (authUser.role === "user") query.customerId = authUser.id;
      else if (authUser.role === "seller") query.sellerId = authUser.id;
      else {
        return NextResponse.json(
          { message: "Admin cannot access customer-seller conversations" },
          { status: 403 },
        );
      }
    }

    if (type === "seller_admin") {
      if (authUser.role === "seller") query.sellerId = authUser.id;
      else if (authUser.role === "admin") query.adminId = authUser.id;
      else {
        return NextResponse.json(
          { message: "Customer cannot access seller-admin conversations" },
          { status: 403 },
        );
      }
    }

    const conversations = await ChatConversation.find(query)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const withUnread = conversations.map((conversation) => {
      const base = mapConversation(conversation);
      let unreadCount = 0;

      if (authUser.role === "user") unreadCount = base.unreadForCustomer;
      if (authUser.role === "seller") unreadCount = base.unreadForSeller;
      if (authUser.role === "admin") unreadCount = base.unreadForAdmin;

      return {
        ...base,
        unreadCount,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: withUnread,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const authUser = getChatUserFromHeaders(req.headers);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { type, peerId } = (await req.json()) as {
      type: ChatConversationType;
      peerId?: string;
    };

    if (!type || !["customer_seller", "seller_admin"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid conversation type" },
        { status: 400 },
      );
    }

    const me: ConversationParticipant = {
      userId: authUser.id,
      role: authUser.role,
      name: authUser.name,
      profileImage: authUser.profileImage || "",
    };

    let conversation: any = null;

    if (type === "customer_seller") {
      if (authUser.role === "user") {
        const seller = await findParticipantForPeer("seller", peerId);
        if (!seller) {
          return NextResponse.json(
            { message: "Seller not found" },
            { status: 404 },
          );
        }

        conversation = await ChatConversation.findOneAndUpdate(
          { type, customerId: me.userId, sellerId: seller.userId },
          {
            $setOnInsert: {
              type,
              customerId: me.userId,
              sellerId: seller.userId,
              participants: [me, seller],
            },
          },
          { upsert: true, new: true },
        );
      } else if (authUser.role === "seller") {
        const customer = await findParticipantForPeer("user", peerId);
        if (!customer) {
          return NextResponse.json(
            { message: "Customer not found" },
            { status: 404 },
          );
        }

        conversation = await ChatConversation.findOneAndUpdate(
          { type, customerId: customer.userId, sellerId: me.userId },
          {
            $setOnInsert: {
              type,
              customerId: customer.userId,
              sellerId: me.userId,
              participants: [customer, me],
            },
          },
          { upsert: true, new: true },
        );
      } else {
        return NextResponse.json(
          { message: "Admin cannot create customer-seller conversations" },
          { status: 403 },
        );
      }
    }

    if (type === "seller_admin") {
      if (authUser.role === "seller") {
        const admin = await findParticipantForPeer("admin", peerId);
        if (!admin) {
          return NextResponse.json(
            { message: "Admin not found" },
            { status: 404 },
          );
        }

        conversation = await ChatConversation.findOneAndUpdate(
          { type, sellerId: me.userId, adminId: admin.userId },
          {
            $setOnInsert: {
              type,
              sellerId: me.userId,
              adminId: admin.userId,
              participants: [me, admin],
            },
          },
          { upsert: true, new: true },
        );
      } else if (authUser.role === "admin") {
        const seller = await findParticipantForPeer("seller", peerId);
        if (!seller) {
          return NextResponse.json(
            { message: "Seller not found" },
            { status: 404 },
          );
        }

        conversation = await ChatConversation.findOneAndUpdate(
          { type, sellerId: seller.userId, adminId: me.userId },
          {
            $setOnInsert: {
              type,
              sellerId: seller.userId,
              adminId: me.userId,
              participants: [seller, me],
            },
          },
          { upsert: true, new: true },
        );
      } else {
        return NextResponse.json(
          { message: "Customer cannot create seller-admin conversations" },
          { status: 403 },
        );
      }
    }

    if (!conversation) {
      return NextResponse.json(
        { message: "Could not create conversation" },
        { status: 400 },
      );
    }

    const io = globalThis.chatIO as SocketIOServer | undefined;
    if (io) {
      for (const participant of conversation.participants || []) {
        io.to(`user:${String(participant.userId)}`).emit(
          "chat:conversation-updated",
          {
            conversationId: conversation._id.toString(),
          },
        );
      }
    }

    return NextResponse.json({
      success: true,
      conversation: mapConversation(conversation),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
