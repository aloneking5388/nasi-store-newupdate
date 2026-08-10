import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/ConnectDB";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";
import { getChatUserFromHeaders } from "@/lib/chatAuth";
import { Server as SocketIOServer } from "socket.io";

type LeanConversationParticipant = {
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
};

type LeanChatConversation = {
  _id: mongoose.Types.ObjectId;
  participants: LeanConversationParticipant[];
};

type LeanChatMessage = {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: string;
  senderRole: string;
  senderName: string;
  senderProfileImage?: string;
  type?: "text" | "image";
  text: string;
  mediaUrl?: string;
  seenBy?: string[];
  createdAt: Date;
};

const mapMessage = (message: any) => ({
  id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId,
  senderRole: message.senderRole,
  senderName: message.senderName,
  senderProfileImage: message.senderProfileImage || "",
  type: message.type || "text",
  text: message.text,
  mediaUrl: message.mediaUrl || "",
  seenBy: message.seenBy || [],
  createdAt: message.createdAt,
});

const unreadResetForRole = (role: string) => {
  if (role === "user") return { unreadForCustomer: 0 };
  if (role === "seller") return { unreadForSeller: 0 };
  if (role === "admin") return { unreadForAdmin: 0 };
  return {};
};

const unreadIncrementForSender = (
  type: "customer_seller" | "seller_admin",
  role: string,
) => {
  if (type === "customer_seller" && role === "user")
    return { unreadForSeller: 1 };
  if (type === "customer_seller" && role === "seller")
    return { unreadForCustomer: 1 };
  if (type === "seller_admin" && role === "seller")
    return { unreadForAdmin: 1 };
  if (type === "seller_admin" && role === "admin")
    return { unreadForSeller: 1 };
  return {};
};

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const authUser = getChatUserFromHeaders(req.headers);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId") || "";
    if (!mongoose.isValidObjectId(conversationId)) {
      return NextResponse.json(
        { message: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    const conversation = (await ChatConversation.findById(
      conversationId,
    ).lean()) as unknown as LeanChatConversation | null;
    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 },
      );
    }

    const isParticipant = (conversation.participants || []).some(
      (p: any) => String(p.userId) === authUser.id,
    );

    if (!isParticipant) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await ChatMessage.updateMany(
      {
        conversationId,
        senderId: { $ne: authUser.id },
        seenBy: { $ne: authUser.id },
      },
      { $addToSet: { seenBy: authUser.id } },
    );

    const unreadReset = unreadResetForRole(authUser.role);
    if (Object.keys(unreadReset).length) {
      await ChatConversation.updateOne(
        { _id: conversationId },
        { $set: unreadReset },
      );
    }

    const io = globalThis.chatIO as SocketIOServer | undefined;
    if (io) {
      io.to(`conversation:${conversationId}`).emit("chat:messages-seen", {
        conversationId,
        seenByUserId: authUser.id,
      });

      for (const participant of conversation.participants || []) {
        io.to(`user:${String(participant.userId)}`).emit(
          "chat:conversation-updated",
          {
            conversationId,
          },
        );
      }
    }

    const messages = (await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(300)
      .lean()) as unknown as LeanChatMessage[];

    return NextResponse.json({
      success: true,
      messages: messages.map(mapMessage),
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

    const { conversationId, text, type, mediaUrl } = (await req.json()) as {
      conversationId: string;
      text: string;
      type?: "text" | "image";
      mediaUrl?: string;
    };

    if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
      return NextResponse.json(
        { message: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    const messageType = type === "image" ? "image" : "text";
    const content = (text || "").trim();
    const normalizedMediaUrl = (mediaUrl || "").trim();

    if (!content && !normalizedMediaUrl) {
      return NextResponse.json(
        { message: "Message text or image is required" },
        { status: 400 },
      );
    }

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 },
      );
    }

    const isParticipant = (conversation.participants || []).some(
      (p: any) => String(p.userId) === authUser.id,
    );

    if (!isParticipant) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const message = await ChatMessage.create({
      conversationId,
      senderId: authUser.id,
      senderRole: authUser.role,
      senderName: authUser.name,
      senderProfileImage: authUser.profileImage || "",
      type: messageType,
      text: content,
      mediaUrl: normalizedMediaUrl,
      seenBy: [authUser.id],
    });

    conversation.lastMessage = messageType === "image" ? "[Image]" : content;
    conversation.lastMessageAt = new Date();

    const unreadInc = unreadIncrementForSender(
      conversation.type as "customer_seller" | "seller_admin",
      authUser.role,
    );

    const unreadReset = unreadResetForRole(authUser.role);
    Object.assign(conversation, {
      ...unreadReset,
      unreadForCustomer:
        unreadInc.unreadForCustomer != null
          ? (conversation.unreadForCustomer || 0) + unreadInc.unreadForCustomer
          : conversation.unreadForCustomer || 0,
      unreadForSeller:
        unreadInc.unreadForSeller != null
          ? (conversation.unreadForSeller || 0) + unreadInc.unreadForSeller
          : conversation.unreadForSeller || 0,
      unreadForAdmin:
        unreadInc.unreadForAdmin != null
          ? (conversation.unreadForAdmin || 0) + unreadInc.unreadForAdmin
          : conversation.unreadForAdmin || 0,
    });

    await conversation.save();

    const io = globalThis.chatIO as SocketIOServer | undefined;
    if (io) {
      const mappedMessage = mapMessage(message);
      io.to(`conversation:${conversationId}`).emit("chat:new-message", {
        conversationId,
        message: mappedMessage,
      });

      for (const participant of conversation.participants || []) {
        io.to(`user:${String(participant.userId)}`).emit(
          "chat:conversation-updated",
          {
            conversationId,
          },
        );
      }
    }

    return NextResponse.json({ success: true, message: mapMessage(message) });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
