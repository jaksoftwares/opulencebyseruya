'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { usePrefetchProducts, useProductSearch } from '@/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/components/providers/QueryProvider';

interface PrefetchContextType {
  prefetchOnHover: (callback: () => void, delay?: number) => void;
  prefetchProduct: (slug: string) => void;
  prefetchCategory: (slug: string) => void;
  prefetchRelatedProducts: (productId: string, categoryId: string) => void;
  prefetchSearchResults: (query: string) => void;
  prefetchNavigationLinks: (links: string[]) => void;
  preloadCriticalData: () => void;
}

const PrefetchContext = createContext<PrefetchContextType | undefined>(undefined);

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const prefetchOnHover = useCallback((callback: () => void, delay: number = 100) => {
    const timeoutId = setTimeout(callback, delay);
    hoverTimeouts.current.set(callback.toString(), timeoutId);
  }, []);

  const prefetchProduct = useCallback(async (slug: string) => {
    // Check if already in cache
    const cacheKey = queryKeys.products.slug(slug);
    const cachedData = queryClient.getQueryData(cacheKey);
    
    if (!cachedData) {
      queryClient.prefetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          // This would trigger the actual product fetch
          return Promise.resolve();
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient]);

  const prefetchCategory = useCallback(async (slug: string) => {
    const cacheKey = queryKeys.categories.slug(slug);
    const cachedData = queryClient.getQueryData(cacheKey);
    
    if (!cachedData) {
      queryClient.prefetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          return Promise.resolve();
        },
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [queryClient]);

  const prefetchRelatedProducts = useCallback(async (productId: string, categoryId: string) => {
    const cacheKey = queryKeys.products.related(productId);
    const cachedData = queryClient.getQueryData(cacheKey);
    
    if (!cachedData) {
      queryClient.prefetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          return Promise.resolve();
        },
        staleTime: 3 * 60 * 1000,
      });
    }
  }, [queryClient]);

  const prefetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) return;

    const cacheKey = queryKeys.products.search(query);
    const cachedData = queryClient.getQueryData(cacheKey);
    
    if (!cachedData) {
      queryClient.prefetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          return Promise.resolve();
        },
        staleTime: 1 * 60 * 1000,
      });
    }
  }, [queryClient]);

  const prefetchNavigationLinks = useCallback(async (links: string[]) => {
    // Prefetch multiple navigation paths simultaneously
    const prefetchPromises = links.map(async (link) => {
      if (link.startsWith('/products/')) {
        const slug = link.split('/').pop();
        if (slug) await prefetchProduct(slug);
      } else if (link.startsWith('/categories/')) {
        const slug = link.split('/').pop();
        if (slug) await prefetchCategory(slug);
      } else if (link.startsWith('/shop')) {
        // Prefetch shop page data
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.list({ limit: 20 }),
          queryFn: async () => Promise.resolve(),
          staleTime: 2 * 60 * 1000,
        });
      }
    });

    // Execute all prefetches in parallel
    Promise.all(prefetchPromises).catch(console.error);
  }, [queryClient, prefetchProduct, prefetchCategory]);

  const preloadCriticalData = useCallback(() => {
    // Preload the most critical data on app initialization
    // These are the data points users are most likely to access first

    // Preload homepage products
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list({ featured: true, limit: 12 }),
      queryFn: async () => Promise.resolve(),
      staleTime: 2 * 60 * 1000,
    });

    // Preload categories
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.lists(),
      queryFn: async () => Promise.resolve(),
      staleTime: 10 * 60 * 1000,
    });

    // Preload shop page
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list({ limit: 20 }),
      queryFn: async () => Promise.resolve(),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return (
    <PrefetchContext.Provider value={{
      prefetchOnHover,
      prefetchProduct,
      prefetchCategory,
      prefetchRelatedProducts,
      prefetchSearchResults,
      prefetchNavigationLinks,
      preloadCriticalData,
    }}>
      {children}
    </PrefetchContext.Provider>
  );
}

export function usePrefetch() {
  const context = useContext(PrefetchContext);
  if (context === undefined) {
    throw new Error('usePrefetch must be used within a PrefetchProvider');
  }
  return context;
}

// Hook for intelligent link preloading
export function useSmartPrefetch() {
  const { prefetchProduct, prefetchCategory, prefetchOnHover } = usePrefetch();

  const prefetchProductLink = useCallback((href: string) => {
    const slug = href.split('/').pop();
    if (slug && href.startsWith('/products/')) {
      prefetchOnHover(() => prefetchProduct(slug));
    }
  }, [prefetchProduct, prefetchOnHover]);

  const prefetchCategoryLink = useCallback((href: string) => {
    const slug = href.split('/').pop();
    if (slug && href.startsWith('/categories/')) {
      prefetchOnHover(() => prefetchCategory(slug));
    }
  }, [prefetchCategory, prefetchOnHover]);

  return { prefetchProductLink, prefetchCategoryLink, prefetchOnHover };
}