import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine, Product } from "@/types";
import { getEffectivePrice } from "@/lib/pricing";

interface CartContextValue {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "gg-cart";

function loadCart(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartLine[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addItem = (product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.product_id === product.product_id);
      if (existing) {
        return prev.map((l) =>
          l.product.product_id === product.product_id
            ? { ...l, quantity: l.quantity + quantity }
            : l
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setLines((prev) => prev.filter((l) => l.product.product_id !== productId));
  };

  const setQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    setLines((prev) =>
      prev.map((l) => (l.product.product_id === productId ? { ...l, quantity } : l))
    );
  };

  const clear = () => setLines([]);

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * getEffectivePrice(l.product), 0);

  return (
    <CartContext.Provider
      value={{ lines, addItem, removeItem, setQuantity, clear, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
