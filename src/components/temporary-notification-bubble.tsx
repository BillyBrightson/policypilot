"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/types";

interface TemporaryNotificationBubbleProps {
  notification: Notification;
  triggerElement: HTMLElement;
}

export function TemporaryNotificationBubble({ notification, triggerElement }: TemporaryNotificationBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate position relative to the bell button
    const updatePosition = () => {
      if (triggerElement && bubbleRef.current) {
        const rect = triggerElement.getBoundingClientRect();
        const bubbleWidth = 320; // Width of the bubble (w-80 = 320px)
        const spacing = 8; // Space between button and bubble
        
        // Calculate center position: button center minus half bubble width
        const buttonCenterX = rect.left + rect.width / 2;
        const bubbleLeft = buttonCenterX - bubbleWidth / 2;
        
        // Ensure bubble stays within viewport
        const minLeft = 16;
        const maxLeft = window.innerWidth - bubbleWidth - 16;
        const finalLeft = Math.max(minLeft, Math.min(bubbleLeft, maxLeft));
        
        setPosition({
          top: rect.bottom + spacing,
          right: window.innerWidth - finalLeft - bubbleWidth,
        });
      }
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    if (triggerElement) {
      resizeObserver.observe(triggerElement);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerElement]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
        return "bg-green-50 border-green-200 text-green-900 shadow-green-100/50";
      case "error":
        return "bg-red-50 border-red-200 text-red-900 shadow-red-100/50";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900 shadow-yellow-100/50";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-[100] w-80 rounded-lg border shadow-lg p-4 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
      } ${getNotificationStyles(notification.type)}`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      {/* Arrow pointing up to the bell - positioned dynamically */}
      <div
        className={`absolute -top-2 w-4 h-4 rotate-45 border-l border-t ${
          notification.type === "success" ? "bg-green-50 border-green-200" :
          notification.type === "error" ? "bg-red-50 border-red-200" :
          notification.type === "warning" ? "bg-yellow-50 border-yellow-200" :
          "bg-blue-50 border-blue-200"
        }`}
        style={{
          right: `calc(50% - 8px)`, // Center the arrow (half of bubble width minus half arrow width)
        }}
      />
      
      <div className="flex items-start gap-3 relative">
        <span className="text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm mt-1 opacity-90 line-clamp-2">{notification.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0 opacity-70 hover:opacity-100"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

