"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification } from "@/lib/types";
import { TemporaryNotification } from "./temporary-notification";

export function NotificationManager() {
  const { user, tenant } = useAuth();
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);

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
              setRecentNotifications((prev) => {
                // Avoid duplicates
                if (prev.some((n) => n.id === notification.id)) {
                  return prev;
                }
                return [notification, ...prev];
              });
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

  const handleDismiss = (notificationId: string) => {
    setRecentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return (
    <>
      {recentNotifications.map((notification) => (
        <TemporaryNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => handleDismiss(notification.id)}
        />
      ))}
    </>
  );
}

