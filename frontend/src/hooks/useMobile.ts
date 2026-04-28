// MIGRATED FROM: src/hooks/use-mobile.tsx — renamed to camelCase to comply with naming convention
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns true when the viewport width is below the mobile breakpoint (768px).
 * Subscribes to window resize events and updates reactively.
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
