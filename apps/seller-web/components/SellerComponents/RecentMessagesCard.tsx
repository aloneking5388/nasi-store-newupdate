"use client";

import axios from "@nasi/api-sdk/client";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type Participant = {
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
};

type Conversation = {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
  unreadCount?: number;
  participants: Participant[];
};

const RecentMessagesCard = () => {
  const { token, userInfo } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token || ""}` } }),
    [token],
  );

  const getPeer = (conversation: Conversation) => {
    return (
      conversation.participants.find(
        (participant) => participant.userId !== userInfo?.id,
      ) || conversation.participants[0]
    );
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadRecentMessages = async () => {
      try {
        const { data } = await axios.get(
          "/chat/conversations?type=customer_seller",
          authHeader,
        );

        if (!isMounted) return;
        setConversations((data?.conversations || []).slice(0, 3));
      } catch {
        if (isMounted) setConversations([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecentMessages();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authHeader]);

  useEffect(() => {
    if (!token) return;

    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
    });

    const refresh = async () => {
      try {
        const { data } = await axios.get(
          "/chat/conversations?type=customer_seller",
          authHeader,
        );
        setConversations((data?.conversations || []).slice(0, 3));
      } catch {
        setConversations([]);
      }
    };

    socket.on("chat:new-message", refresh);
    socket.on("chat:conversation-updated", refresh);

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authHeader]);

  const recentConversation = conversations[0];
  const recentPeer = recentConversation ? getPeer(recentConversation) : null;

  return (
    <div className="w-full bg-[#283046] text-[#d0d2d6]">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Seller Message</h2>
        <Link
          href="/seller/chatcustomer"
          className="text-sm font-medium text-indigo-300"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-3 pt-6 text-[#d0d2d6]">
        {loading ? (
          <div className="rounded-md border border-slate-600 bg-[#1f273a] p-4 text-sm text-slate-400">
            Loading chat messages...
          </div>
        ) : recentConversation ? (
          <ol className="relative rounded-md p-4 border border-slate-600 bg-[#1f273a]">
            <li className="relative pl-12">
              <div className="absolute left-0 top-0 w-10 h-10 overflow-hidden rounded-full border border-slate-600 bg-[#00d1e848]">
                <div className="relative h-full w-full">
                  {recentPeer?.profileImage ? (
                    <Image
                      src={recentPeer.profileImage}
                      alt={recentPeer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-700 text-sm font-semibold uppercase text-white">
                      {recentPeer?.name?.slice(0, 1) || "C"}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between gap-3">
                  <span className="text-sm font-medium truncate">
                    {recentPeer?.name || "Unknown customer"}
                  </span>
                  <span className="text-xs whitespace-nowrap">
                    {new Date(
                      recentConversation.lastMessageAt ||
                        recentConversation.updatedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 text-xs bg-slate-700 p-2 rounded wrap-break-word">
                  {recentConversation.lastMessage || "Start chatting..."}
                </div>
              </div>
            </li>
          </ol>
        ) : (
          <div className="rounded-md border border-slate-600 bg-[#1f273a] p-4 text-sm text-slate-400">
            No recent customer messages yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMessagesCard;
