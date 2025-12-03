'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/components/providers/QueryProvider';
import { useCategories, useProducts } from '@/hooks/api';

interface SmartHydrationContextType {
  isPrehydrated: boolean;
  criticalDataLoaded: boolean;
  prefetchCriticalContent: () => void;
  prefetchUserContent: () => void;
}

const SmartHydrationContext = createContext<SmartHydrationContextType | undefined>(undefined);

export function SmartHydrationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isPrehydrated, setIsPrehydrated] = useState(false);
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);

  // Preload critical data on mount
  useEffect(() => {
    const preloadCritical = async () => {
      try {
        // Preload the most important data immediately
        await Promise.all([
          // Categories for navigation
          queryClient.prefetchQuery({
            queryKey: queryKeys.categories.lists(),
            queryFn: () => Promise.resolve(),
            staleTime: 10 * 60 * 1000,
          }),
          
          // Featured products for homepage
          queryClient.prefetchQuery({
            queryKey: queryKeys.products.list({ featured: true, limit: 12 }),
            queryFn: () => Promise.resolve(),
            staleTime: 5 * 60 * 1000,
          }),
          
          // Top deals for quick access
          queryClient.prefetchQuery({
            queryKey: queryKeys.products.list({ featured: true, limit: 8 }),
            queryFn: () => Promise.resolve(),
            staleTime: 3 * 60 * 1000,
          }),
        ]);
        
        setCriticalDataLoaded(true);
        setIsPrehydrated(true);
      } catch (error) {
        console.error('Smart hydration preload failed:', error);
        setIsPrehydrated(true); // Still mark as prehydrated to avoid blocking
      }
    };

    // Start preloading immediately
    preloadCritical();
  }, [queryClient]);

  const prefetchCriticalContent = async () => {
    try {
      await Promise.all([
        // Shop page data
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.list({ limit: 20 }),
          queryFn: () => Promise.resolve(),
          staleTime: 5 * 60 * 1000,
        }),
        
        // New arrivals
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.list({ featured: true, limit: 12 }),
          queryFn: () => Promise.resolve(),
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    } catch (error) {
      console.error('Critical content prefetch failed:', error);
    }
  };

  const prefetchUserContent = async () => {
    try {
      // Prefetch user-specific content when needed
      // This would typically be called after user authentication
      await Promise.all([
        // User cart data (if authenticated)
        queryClient.prefetchQuery({
          queryKey: queryKeys.cart.items(),
          queryFn: () => Promise.resolve(),
          staleTime: 2 * 60 * 1000,
        }),
        
        // Recent orders (if authenticated)
        queryClient.prefetchQuery({
          queryKey: queryKeys.orders.lists(),
          queryFn: () => Promise.resolve(),
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    } catch (error) {
      console.error('User content prefetch failed:', error);
    }
  };

  return (
    <SmartHydrationContext.Provider value={{
      isPrehydrated,
      criticalDataLoaded,
      prefetchCriticalContent,
      prefetchUserContent,
    }}>
      {children}
    </SmartHydrationContext.Provider>
  );
}

export function useSmartHydration() {
  const context = useContext(SmartHydrationContext);
  if (context === undefined) {
    throw new Error('useSmartHydration must be used within a SmartHydrationProvider');
  }
  return context;
}

// Component for hydrating specific data types
export function DataHydrator({ 
  children, 
  hydrateOnView = false 
}: { 
  children: React.ReactNode; 
  hydrateOnView?: boolean;
}) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!hydrateOnView || hasHydrated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasHydrated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('hydration-target');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [hydrateOnView, hasHydrated]);

  return (
    <div id="hydration-target">
      {hasHydrated && children}
    </div>
  );
}

// Hook for intelligent prefetching based on user behavior
export function useSmartPrefetch() {
  const queryClient = useQueryClient();
  const { prefetchCriticalContent, prefetchUserContent } = useSmartHydration();

  const prefetchBasedOnPath = (pathname: string) => {
    // Intelligent prefetching based on current path
    switch (pathname) {
      case '/':
        // Homepage - prefetch shop and categories
        queryClient.prefetchQuery({
          queryKey: queryKeys.categories.lists(),
          queryFn: () => Promise.resolve(),
          staleTime: 10 * 60 * 1000,
        });
        break;
        
      case '/shop':
        // Shop page - prefetch more products
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.list({ limit: 40 }),
          queryFn: () => Promise.resolve(),
          staleTime: 5 * 60 * 1000,
        });
        break;
        
      case '/categories':
        // Categories - prefetch all categories
        queryClient.prefetchQuery({
          queryKey: queryKeys.categories.lists(),
          queryFn: () => Promise.resolve(),
          staleTime: 15 * 60 * 1000,
        });
        break;
    }
  };

  const prefetchRelatedContent = (currentPath: string) => {
    // Prefetch likely next destinations
    if (currentPath.startsWith('/products/')) {
      // Product page - prefetch related products
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.list({ featured: true, limit: 4 }),
        queryFn: () => Promise.resolve(),
        staleTime: 3 * 60 * 1000,
      });
    }
  };

  return {
    prefetchCriticalContent,
    prefetchUserContent,
    prefetchBasedOnPath,
    prefetchRelatedContent,
  };
}

// Component for background data synchronization
export function BackgroundSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up periodic background sync
    const syncInterval = setInterval(() => {
      // Sync critical data in background
      queryClient.refetchQueries({
        queryKey: queryKeys.categories.lists(),
        type: 'active',
      });
      
      queryClient.refetchQueries({
        queryKey: queryKeys.products.list({ featured: true, limit: 12 }),
        type: 'active',
      });
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(syncInterval);
  }, [queryClient]);

  return null;
}