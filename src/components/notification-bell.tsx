"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotificationsByUser, markNotificationAsRead, getUnreadNotificationCount } from "@/lib/db";
import type { Notification } from "@/lib/types";
import Link from "next/link";
import { onSnapshot, query, where, orderBy, limit, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TemporaryNotificationBubble } from "./temporary-notification-bubble";
// Helper function to format relative time
const formatRelativeTime = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return d.toLocaleDateString();
};

export function NotificationBell() {
  const { user, userDoc, tenant } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentNotification, setRecentNotification] = useState<Notification | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user && userDoc && tenant) {
      loadNotifications();
      loadUnreadCount();
      
      // Set up real-time listener for new notifications
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, userDoc, tenant]);

  // Listen for new notifications in real-time
  useEffect(() => {
    if (!user || !tenant) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("tenantId", "==", tenant.id),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              createdAt: change.doc.data().createdAt?.toDate() || new Date(),
            } as Notification;

            // Only show if it's very recent (within last 5 seconds)
            const notificationTime = new Date(notification.createdAt).getTime();
            const now = Date.now();
            if (now - notificationTime < 5000) {
              setRecentNotification(notification);
              // Auto-dismiss after 1.5 seconds
              setTimeout(() => {
                setRecentNotification(null);
              }, 1500);
            }
          }
        });
      },
      (error) => {
        console.error("Error listening to notifications:", error);
      }
    );

    return () => unsubscribe();
  }, [user, tenant]);

  const loadNotifications = async () => {
    if (!user || !tenant) return;
    try {
      const notifs = await getNotificationsByUser(user.uid, tenant.id, 10);
      setNotifications(notifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user || !tenant) return;
    try {
      const count = await getUnreadNotificationCount(user.uid, tenant.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (!user || !tenant) return null;

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" ref={bellButtonRef}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <p className="text-sm font-semibold">Notifications</p>
          <Link href="/activity-logs">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View All
            </Button>
          </Link>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className={`text-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    {recentNotification && bellButtonRef.current && (
      <TemporaryNotificationBubble
        notification={recentNotification}
        triggerElement={bellButtonRef.current}
      />
    )}
    </div>
  );
}

