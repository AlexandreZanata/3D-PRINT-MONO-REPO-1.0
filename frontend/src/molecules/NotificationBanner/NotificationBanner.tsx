import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/store/notificationStore";

interface NotificationBannerProps {
  id: string;
  type: NotificationType;
  message: string;
  onDismiss: (id: string) => void;
}

const typeClasses: Record<NotificationType, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

/**
 * NotificationBanner molecule — single toast notification.
 * Pure: receives all data via props, emits dismiss via onDismiss callback.
 */
export function NotificationBanner({
  id,
  type,
  message,
  onDismiss,
}: NotificationBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm",
        typeClasses[type],
      )}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-current rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
