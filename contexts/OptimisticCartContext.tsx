'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem, getCart, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateQuantity as updateQuantityUtil, clearCart as clearCartUtil, getCartTotal } from '@/lib/cart';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/components/providers/QueryProvider';

interface OptimisticCartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  isPending: boolean;
  error: string | null;
}

const OptimisticCartContext = createContext<OptimisticCartContextType | undefined>(undefined);

export const OptimisticCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load cart on mount
  useEffect(() => {
    setCart(getCart());
  }, []);

  // Optimistic mutation for adding items to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: Omit<CartItem, 'quantity'>) => {
      // Simulate API call delay for testing optimistic updates
      await new Promise(resolve => setTimeout(resolve, 100));
      return addToCartUtil(item);
    },
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });

      // Snapshot previous value
      const previousCart = getCart();

      // Optimistically update to the new value
      const optimisticCart = addToCartUtil(newItem);
      setCart(optimisticCart);
      setIsPending(true);
      setError(null);

      return { previousCart, optimisticCart };
    },
    onError: (err, newItem, context) => {
      // Rollback optimistic update on error
      if (context?.previousCart) {
        setCart(context.previousCart);
        setError('Failed to add item to cart');
        toast({
          title: 'Error',
          description: 'Failed to add item to cart. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      // Invalidate cart queries to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      setError(null);
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Optimistic mutation for removing items from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return removeFromCartUtil(productId);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });

      const previousCart = getCart();
      const optimisticCart = removeFromCartUtil(productId);
      setCart(optimisticCart);
      setIsPending(true);
      setError(null);

      return { previousCart, optimisticCart };
    },
    onError: (err, productId, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
        setError('Failed to remove item from cart');
        toast({
          title: 'Error',
          description: 'Failed to remove item from cart. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      setError(null);
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Optimistic mutation for updating quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return updateQuantityUtil(productId, quantity);
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });

      const previousCart = getCart();
      const optimisticCart = updateQuantityUtil(productId, quantity);
      setCart(optimisticCart);
      setIsPending(true);
      setError(null);

      return { previousCart, optimisticCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
        setError('Failed to update quantity');
        toast({
          title: 'Error',
          description: 'Failed to update quantity. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      setError(null);
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Optimistic mutation for clearing cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return clearCartUtil();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });

      const previousCart = getCart();
      clearCartUtil();
      setCart([]);
      setIsPending(true);
      setError(null);

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
        setError('Failed to clear cart');
        toast({
          title: 'Error',
          description: 'Failed to clear cart. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      setError(null);
      toast({
        title: 'Cart Cleared',
        description: 'Your cart has been cleared successfully.',
      });
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Enhanced cart methods with optimistic updates
  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'>) => {
    addToCartMutation.mutate(item);
    
    // Show optimistic toast
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  }, [addToCartMutation, toast]);

  const removeFromCart = useCallback(async (productId: string) => {
    removeFromCartMutation.mutate(productId);
  }, [removeFromCartMutation]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    updateQuantityMutation.mutate({ productId, quantity });
  }, [updateQuantityMutation, removeFromCart]);

  const clearCart = useCallback(async () => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  // Calculate totals
  const cartTotal = getCartTotal(cart);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Auto-reload cart from localStorage when window becomes focused
  useEffect(() => {
    const handleFocus = () => {
      const currentCart = getCart();
      setCart(currentCart);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Background sync with localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCart = getCart();
      if (JSON.stringify(currentCart) !== JSON.stringify(cart)) {
        setCart(currentCart);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [cart]);

  return (
    <OptimisticCartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isPending,
      error,
    }}>
      {children}
    </OptimisticCartContext.Provider>
  );
};

export const useOptimisticCart = () => {
  const context = useContext(OptimisticCartContext);
  if (context === undefined) {
    throw new Error('useOptimisticCart must be used within an OptimisticCartProvider');
  }
  return context;
};