"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotificationsQuery";
import { LEADS_QUERY_KEY } from "./useLeadsQuery";
import {
  getUnreadCount,
  NOTIFICATIONS_NAMESPACE,
  Notification,
  NotificationSocketEvents,
} from "../services/notifications.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tygry8.saikat.com.bd";

export function useNotificationsSocket() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<Notification | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    let cancelled = false;
    let socket: Socket | null = null;

    const invalidateList = () => {
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [LEADS_QUERY_KEY],
      });
    };

    const bootstrap = async () => {
      try {
        const count = await getUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // REST bootstrap is best-effort; socket will refresh on connect.
      }

      socket = io(`${API_URL}${NOTIFICATIONS_NAMESPACE}`, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      socket.on("connect", () => {
        if (!cancelled) setConnected(true);
      });

      socket.on("disconnect", () => {
        if (!cancelled) setConnected(false);
      });

      socket.on(
        NotificationSocketEvents.UNREAD_COUNT,
        (payload: { count: number }) => {
          if (!cancelled) setUnreadCount(payload?.count ?? 0);
        },
      );

      socket.on(
        NotificationSocketEvents.CREATED,
        (notification: Notification) => {
          if (cancelled) return;
          setLatest(notification);
          invalidateList();
        },
      );

      socket.on(NotificationSocketEvents.READ, () => {
        if (!cancelled) invalidateList();
      });
    };

    void bootstrap();

    return () => {
      cancelled = true;
      socket?.disconnect();
      setConnected(false);
    };
  }, [accessToken, isAuthenticated, queryClient]);

  const signedIn = isAuthenticated && !!accessToken;
  return {
    unreadCount: signedIn ? unreadCount : 0,
    latest,
    connected: signedIn ? connected : false,
  };
}
