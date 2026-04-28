import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the value that only updates after
 * the specified delay has elapsed without a new value being set.
 *
 * @param value  The value to debounce
 * @param delayMs  Debounce delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
