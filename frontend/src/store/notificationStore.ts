import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly message: string;
  readonly durationMs: number;
}

interface NotificationState {
  queue: Notification[];
}

interface NotificationActions {
  push: (notification: Omit<Notification, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Global notification (toast) store.
 * Components read queue and render toasts. Hooks push notifications.
 */
export const useNotificationStore = create<NotificationState & NotificationActions>((set) => ({
  queue: [],

  push: (notification) =>
    set((state) => ({
      queue: [
        ...state.queue,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),

  dismiss: (id) =>
    set((state) => ({ queue: state.queue.filter((n) => n.id !== id) })),

  clear: () => set({ queue: [] }),
}));
