"use client";

import { useAppSelector } from "@/store/hooks";
import axios from "@nasi/api-sdk/client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChevronLeft } from "lucide-react";

type ConversationType = "customer_seller" | "seller_admin";

type Participant = {
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
};

type Conversation = {
  id: string;
  type: ConversationType;
  customerId?: string;
  sellerId?: string;
  adminId?: string;
  participants: Participant[];
  unreadCount?: number;
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  senderProfileImage?: string;
  type?: "text" | "image";
  text: string;
  mediaUrl?: string;
  seenBy?: string[];
  createdAt: string;
};

interface LiveChatPanelProps {
  type: ConversationType;
  initialPeerId?: string;
  title: string;
  subtitle: string;
}

const LiveChatPanel = ({
  type,
  initialPeerId,
  title,
  subtitle,
}: LiveChatPanelProps) => {
  const { token, userInfo } = useAppSelector((state) => state.auth);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [typingByConversation, setTypingByConversation] = useState<
    Record<string, { userId: string; name: string }>
  >({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token || ""}` } }),
    [token],
  );

  const getPeer = (conversation: Conversation) => {
    return (
      conversation.participants.find((p) => p.userId !== userInfo?.id) ||
      conversation.participants[0]
    );
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId],
  );
  const activePeer = activeConversation ? getPeer(activeConversation) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        `/chat/conversations?type=${type}`,
        authHeader,
      );
      setConversations(data?.conversations || []);
      setError("");

      const list: Conversation[] = data?.conversations || [];
      if (!activeConversationId && list.length > 0) {
        setActiveConversationId(list[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  };

  const ensureConversation = async () => {
    if (!token) return;

    if (type === "customer_seller" && !initialPeerId) return;

    if (type === "seller_admin") {
      const body = initialPeerId ? { type, peerId: initialPeerId } : { type };
      const { data } = await axios.post(
        `/chat/conversations`,
        body,
        authHeader,
      );
      if (data?.conversation?.id) {
        setActiveConversationId(data.conversation.id);
        if (initialPeerId) {
          setMobileView("chat");
        }
      }
      return;
    }

    const { data } = await axios.post(
      `/chat/conversations`,
      { type, peerId: initialPeerId },
      authHeader,
    );

    if (data?.conversation?.id) {
      setActiveConversationId(data.conversation.id);
      setMobileView("chat");
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!token || !conversationId) return;

    setLoadingMessages(true);
    try {
      const { data } = await axios.get(
        `/chat/messages?conversationId=${conversationId}`,
        authHeader,
      );
      setMessages(data?.messages || []);
      setError("");
      setTimeout(scrollToBottom, 30);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !text.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await axios.post(
        "/chat/messages",
        { conversationId: activeConversationId, text: text.trim() },
        authHeader,
      );
      setText("");
      if (data?.message) {
        setMessages((prev) => {
          if (prev.some((message) => message.id === data.message.id))
            return prev;
          return [...prev, data.message];
        });
        setTimeout(scrollToBottom, 20);
      }
      await fetchConversations();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (file: File) => {
    if (!activeConversationId || !token || uploadingImage) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("/chat/upload", formData, {
        ...authHeader,
        headers: {
          ...authHeader.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = uploadRes?.data?.url;
      if (!imageUrl) throw new Error("Image upload failed");

      const { data } = await axios.post(
        "/chat/messages",
        {
          conversationId: activeConversationId,
          type: "image",
          mediaUrl: imageUrl,
          text: "",
        },
        authHeader,
      );

      if (data?.message) {
        setMessages((prev) => {
          if (prev.some((message) => message.id === data.message.id))
            return prev;
          return [...prev, data.message];
        });
        setTimeout(scrollToBottom, 20);
      }
      await fetchConversations();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send image.");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    const start = async () => {
      try {
        await ensureConversation();
      } catch {
        // Ignore create conversation errors here and continue loading list.
      }
      await fetchConversations();
    };

    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, type, initialPeerId]);

  useEffect(() => {
    if (!token) return;

    const baseUrl = window.location.origin;

    const socket = io(baseUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {});

    socket.on(
      "chat:new-message",
      (payload: { conversationId: string; message: ChatMessage }) => {
        if (payload.conversationId === activeConversationId) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.message.id);
            if (exists) return prev;
            return [...prev, payload.message];
          });
          setTimeout(scrollToBottom, 20);
        }
        fetchConversations();
      },
    );

    socket.on(
      "chat:messages-seen",
      (payload: { conversationId: string; seenByUserId: string }) => {
        if (payload.conversationId !== activeConversationId) return;
        setMessages((prev) =>
          prev.map((message) => {
            if (message.senderId !== userInfo?.id) return message;
            if ((message.seenBy || []).includes(payload.seenByUserId))
              return message;
            return {
              ...message,
              seenBy: [...(message.seenBy || []), payload.seenByUserId],
            };
          }),
        );
      },
    );

    socket.on(
      "chat:typing",
      (payload: {
        conversationId: string;
        userId: string;
        name: string;
        isTyping: boolean;
      }) => {
        if (payload.conversationId !== activeConversationId) return;
        setTypingByConversation((prev) => {
          const next = { ...prev };
          if (payload.isTyping) {
            next[payload.conversationId] = {
              userId: payload.userId,
              name: payload.name,
            };
          } else {
            delete next[payload.conversationId];
          }
          return next;
        });
      },
    );

    socket.on(
      "presence:update",
      (payload: { userId: string; online: boolean }) => {
        setOnlineUsers((prev) => ({
          ...prev,
          [payload.userId]: payload.online,
        }));
      },
    );

    socket.on(
      "presence:sync",
      (payload: { statuses: Record<string, boolean> }) => {
        setOnlineUsers((prev) => ({ ...prev, ...(payload?.statuses || {}) }));
      },
    );

    socket.on("chat:conversation-updated", () => {
      fetchConversations();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, type]);

  useEffect(() => {
    if (!activeConversationId || !token) return;

    fetchMessages(activeConversationId);
    socketRef.current?.emit("chat:join", {
      conversationId: activeConversationId,
    });

    return () => {
      socketRef.current?.emit("chat:leave", {
        conversationId: activeConversationId,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, token]);

  useEffect(() => {
    if (!socketRef.current || conversations.length === 0) return;

    const peerIds = conversations
      .map((conversation) => getPeer(conversation)?.userId)
      .filter((id): id is string => Boolean(id));

    socketRef.current.emit("presence:sync-request", { userIds: peerIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    const fallback = setInterval(() => {
      fetchConversations();
      if (activeConversationId) {
        fetchMessages(activeConversationId);
      }
    }, 20000);

    return () => clearInterval(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeConversationId, type]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-700">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}

      <div className="bg-[#283046] text-[#d0d2d6] border border-slate-700 rounded-md h-[78vh] md:min-h-[70vh] flex flex-col md:flex-row overflow-hidden">
        <aside
          className={`w-full md:w-[32%] border-b md:border-b-0 md:border-r border-slate-700 bg-[#1f273a] ${
            mobileView === "chat" ? "hidden md:block" : "block"
          }`}
        >
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="font-semibold text-[#f8fafc]">Conversations</h3>
          </div>

          <div className="max-h-[calc(78vh-52px)] md:max-h-[calc(70vh-52px)] overflow-y-auto">
            {loadingConversations ? (
              <p className="p-4 text-sm text-slate-400">
                Loading conversations...
              </p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conversation) => {
                const peer = getPeer(conversation);
                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                      setMobileView("chat");
                    }}
                    className={`w-full text-left p-4 border-b transition ${
                      activeConversationId === conversation.id
                        ? "bg-slate-700/70"
                        : "hover:bg-slate-700/40"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-semibold text-[#f8fafc] truncate">
                        {peer?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            onlineUsers[peer?.userId || ""]
                              ? "bg-green-500"
                              : "bg-slate-300"
                          }`}
                        />
                        <span className="text-[11px] text-slate-400 uppercase">
                          {peer?.role}
                        </span>
                        {(conversation.unreadCount || 0) > 0 ? (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {conversation.lastMessage || "Start chatting..."}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`w-full md:w-[68%] flex flex-col ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-4 py-3 border-b border-slate-700 bg-[#1f273a] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded border border-slate-600 text-slate-200"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-[#f8fafc]">
              {activePeer?.name || "Select conversation"}
            </h3>
            {activePeer ? (
              <p className="text-xs text-slate-400 mt-1">
                {typingByConversation[activeConversationId]?.userId ===
                activePeer.userId
                  ? `${typingByConversation[activeConversationId]?.name} is typing...`
                  : onlineUsers[activePeer.userId]
                    ? "Online"
                    : "Offline"}
              </p>
            ) : null}
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#161d31] max-h-[calc(78vh-124px)] md:max-h-[calc(70vh-116px)]">
            {!activeConversationId ? (
              <p className="text-sm text-slate-400">
                Select a conversation to begin.
              </p>
            ) : loadingMessages ? (
              <p className="text-sm text-slate-400">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-400">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((message) => {
                const mine = message.senderId === userInfo?.id;
                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-lg ${
                        mine
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-[#283046] text-[#d0d2d6] border border-slate-700 rounded-bl-sm"
                      }`}
                    >
                      {!mine ? (
                        <p className="text-[11px] font-semibold mb-1 opacity-80">
                          {message.senderName}
                        </p>
                      ) : null}
                      {message.type === "image" && message.mediaUrl ? (
                        <a
                          href={message.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={message.mediaUrl}
                            alt="chat"
                            className="rounded-md max-h-55 w-auto"
                          />
                        </a>
                      ) : null}
                      {message.text ? (
                        <p className="text-sm wrap-break-word">
                          {message.text}
                        </p>
                      ) : null}
                      <p
                        className={`text-[10px] mt-1 ${mine ? "text-indigo-100" : "text-slate-400"}`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {mine
                          ? ` • ${
                              (message.seenBy || []).some(
                                (id) => id !== userInfo?.id,
                              )
                                ? "Seen"
                                : "Sent"
                            }`
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-slate-700 flex flex-wrap md:flex-nowrap gap-2 bg-[#1f273a]"
          >
            <label className="px-3 py-2 rounded-md border border-slate-600 text-sm text-[#d0d2d6] cursor-pointer bg-[#283046] order-1">
              {uploadingImage ? "Uploading..." : "Image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={!activeConversationId || uploadingImage || sending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) sendImage(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (!activeConversationId || !socketRef.current) return;

                socketRef.current.emit("chat:typing", {
                  conversationId: activeConversationId,
                  isTyping: true,
                });

                if (typingTimeoutRef.current)
                  clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  socketRef.current?.emit("chat:typing", {
                    conversationId: activeConversationId,
                    isTyping: false,
                  });
                }, 1200);
              }}
              placeholder="Type your message..."
              className="w-full md:flex-1 border border-slate-600 rounded-md px-3 py-2 text-sm outline-none bg-[#161d31] text-[#d0d2d6] focus:border-indigo-500 order-3 md:order-2"
              disabled={!activeConversationId || sending || uploadingImage}
            />
            <button
              type="submit"
              disabled={
                !activeConversationId ||
                sending ||
                uploadingImage ||
                !text.trim()
              }
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-60 order-2 md:order-3"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LiveChatPanel;
