// MIGRATED FROM: src/lib/cart.tsx — moved to features/cart to comply with feature module structure
import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "@/lib/products";

export type CartItem = { productId: string; quantity: number };

export type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  detailed: { product: Product; quantity: number }[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "forma_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore parse errors */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore storage errors */
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const detailed = items
      .map((i) => {
        const product = PRODUCTS.find((p) => p.id === i.productId);
        return product ? { product, quantity: i.quantity } : null;
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);

    return {
      items,
      detailed,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: detailed.reduce((sum, d) => sum + d.product.price * d.quantity, 0),
      add: (productId, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            return prev.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
            );
          }
          return [...prev, { productId, quantity }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQuantity: (productId, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
