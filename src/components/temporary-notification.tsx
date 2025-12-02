"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/types";

interface TemporaryNotificationProps {
  notification: Notification;
  onDismiss: () => void;
}

export function TemporaryNotification({ notification, onDismiss }: TemporaryNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

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

  const getNotificationStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 min-w-[300px] max-w-md rounded-lg border shadow-lg p-4 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${getNotificationStyles(notification.type)}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm mt-1 opacity-90">{notification.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

