"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, CartItem } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function refreshCart() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.cart.get();
      setCartItems(data.items ?? []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) refreshCart();
    else setCartItems([]);
  }, [user]);

  async function addToCart(productId: number, quantity = 1) {
    if (!user) {
      throw new Error("LOGIN_REQUIRED");
    }
    await api.cart.add({ product_id: productId, quantity });
    await refreshCart();
  }

  async function updateItem(cartItemId: number, quantity: number) {
    if (quantity <= 0) {
      await api.cart.remove(cartItemId);
    } else {
      await api.cart.update(cartItemId, quantity);
    }
    await refreshCart();
  }

  async function removeItem(cartItemId: number) {
    await api.cart.remove(cartItemId);
    await refreshCart();
  }

  async function clearCart() {
    await api.cart.clear();
    setCartItems([]);
  }

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, totalItems, totalPrice, loading,
      addToCart, updateItem, removeItem, clearCart, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
