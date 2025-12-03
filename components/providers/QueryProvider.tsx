'use client';

import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: React.ReactNode;
  dehydratedState?: DehydratedState | null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Smart caching strategy for better performance
        staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 408 (timeout)
          if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        // Background refetch for fresh data
        refetchOnMount: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({ 
  children, 
  dehydratedState 
}: QueryProviderProps) {
  // NOTE: Avoid useState here for performance reasons
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Export utility functions for prefetching
export { dehydrate, getQueryClient };

// Query key factory for consistent cache keys
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      ['products', 'list', { filters }] as const,
    details: () => ['products', 'detail'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    slug: (slug: string) => ['products', 'detail', 'slug', slug] as const,
    related: (id: string) => ['products', 'detail', id, 'related'] as const,
    search: (query: string, filters?: Record<string, unknown>) => 
      ['products', 'search', query, filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => ['categories', 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      ['categories', 'list', { filters }] as const,
    details: () => ['categories', 'detail'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    slug: (slug: string) => ['categories', 'detail', 'slug', slug] as const,
  },
  cart: {
    all: ['cart'] as const,
    items: () => ['cart', 'items'] as const,
    total: () => ['cart', 'total'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (customerId?: string) => ['orders', 'list', customerId] as const,
    details: () => ['orders', 'detail'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
};