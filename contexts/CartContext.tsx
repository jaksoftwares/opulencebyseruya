'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, getCart, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateQuantity as updateQuantityUtil, clearCart as clearCartUtil, getCartTotal } from '@/lib/cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const updatedCart = addToCartUtil(item);
    setCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = removeFromCartUtil(productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = updateQuantityUtil(productId, quantity);
    setCart(updatedCart);
  };

  const clearCart = () => {
    clearCartUtil();
    setCart([]);
  };

  const cartTotal = getCartTotal(cart);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
