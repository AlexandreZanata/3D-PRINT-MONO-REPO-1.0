import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Manages dark mode preference.
 * Stores the preference in localStorage under "forma_dark_mode".
 * Applies/removes the "dark" class on <html> so Tailwind's class-based
 * dark mode strategy activates the .dark variant.
 */
export function useDarkMode(): {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
} {
  const [isDark, setIsDark] = useLocalStorage<boolean>("forma_dark_mode", false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return {
    isDark,
    toggle: () => setIsDark(!isDark),
    setDark: setIsDark,
  };
}
