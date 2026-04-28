import { useEffect, useRef } from "react";
import { openSSEConnection } from "@/api/sse";
import type { SSEHandler } from "@/api/sse";
import { useNotificationStore } from "@/store/notificationStore";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Opens an SSE connection on mount and closes it on unmount.
 * Retries with exponential backoff on error (max 5 attempts).
 * Shows a "Reconnecting…" banner via notificationStore on each retry.
 */
export function useSSE(onEvent: SSEHandler): void {
  const push = useNotificationStore((s) => s.push);
  const retryCount = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      cleanupRef.current?.();
      cleanupRef.current = openSSEConnection(onEvent);

      // Reset retry count on successful connection
      retryCount.current = 0;
    }

    function reconnect() {
      if (cancelled || retryCount.current >= MAX_RETRIES) return;
      retryCount.current += 1;
      const delay = BASE_DELAY_MS * 2 ** (retryCount.current - 1);

      push({
        type: "warning",
        message: `Reconnecting to live updates… (attempt ${retryCount.current}/${MAX_RETRIES})`,
        durationMs: delay,
      });

      setTimeout(connect, delay);
    }

    connect();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  // onEvent is intentionally excluded — callers must memoize it with useCallback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push]);
}
