// MIGRATED FROM: src/lib/cart.tsx (useCart hook) — moved to features/cart
import { useContext } from "react";
import { CartContext } from "./CartProvider";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
