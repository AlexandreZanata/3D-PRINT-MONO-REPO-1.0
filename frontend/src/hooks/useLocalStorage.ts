import { useCallback, useEffect, useState } from "react";

/**
 * Persists state to localStorage and keeps it in sync across tabs.
 * Falls back to the initialValue if the key is missing or unparseable.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStored(value);
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore write errors (e.g. private browsing quota)
      }
    },
    [key],
  );

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStored(e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        setStored(initialValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  return [stored, setValue];
}
