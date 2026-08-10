import mongoose, { Schema, model, models } from "mongoose";

export type ChatConversationType = "customer_seller" | "seller_admin";

const participantSchema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    profileImage: { type: String, default: "" },
  },
  { _id: false },
);

const chatConversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["customer_seller", "seller_admin"],
      required: true,
    },
    customerId: { type: String, default: null, index: true },
    sellerId: { type: String, default: null, index: true },
    adminId: { type: String, default: null, index: true },
    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr: Array<{ userId: string }>) => arr.length >= 2,
        message: "Conversation must contain at least two participants.",
      },
    },
    unreadForCustomer: { type: Number, default: 0 },
    unreadForSeller: { type: Number, default: 0 },
    unreadForAdmin: { type: Number, default: 0 },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

chatConversationSchema.index(
  { type: 1, customerId: 1, sellerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "customer_seller",
      customerId: { $type: "string" },
      sellerId: { $type: "string" },
    },
  },
);

chatConversationSchema.index(
  { type: 1, sellerId: 1, adminId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "seller_admin",
      sellerId: { $type: "string" },
      adminId: { $type: "string" },
    },
  },
);

const ChatConversation =
  models.ChatConversation || model("ChatConversation", chatConversationSchema);

export default ChatConversation;
