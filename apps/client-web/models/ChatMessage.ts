import mongoose, { Schema, model, models } from "mongoose";

const chatMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderName: { type: String, required: true },
    senderProfileImage: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    text: { type: String, default: "", trim: true },
    mediaUrl: { type: String, default: "" },
    seenBy: { type: [String], default: [] },
  },
  { timestamps: true },
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ChatMessage =
  models.ChatMessage || model("ChatMessage", chatMessageSchema);

export default ChatMessage;
