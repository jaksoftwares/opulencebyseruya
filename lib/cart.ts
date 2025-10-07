'use client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

const CART_KEY = 'opulence_cart';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (item: Omit<CartItem, 'quantity'>) => {
  const cart = getCart();
  const existingItem = cart.find((i) => i.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: string) => {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
};

export const updateQuantity = (productId: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);

  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      return removeFromCart(productId);
    }
  }

  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};
