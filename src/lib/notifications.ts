/**
 * Notification Helper
 * 
 * Creates notifications and stores them in Firestore
 */

import { createNotification } from "@/lib/db";
import type { NotificationType } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { getTenantByOwner } from "@/lib/db";

export async function createStoredNotification(
  type: NotificationType,
  title: string,
  description: string
): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user authenticated");
      return null;
    }

    const tenant = await getTenantByOwner(user.uid);
    if (!tenant) {
      console.error("No tenant found for user");
      return null;
    }

    const notificationId = await createNotification({
      tenantId: tenant.id,
      userId: user.uid,
      type,
      title,
      description,
      read: false,
      createdAt: new Date(),
    });

    return notificationId;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

