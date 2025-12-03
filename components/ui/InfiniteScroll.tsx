'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfiniteScrollProps {
  // Query function that returns data and next cursor
  queryFn: (params: { pageParam?: unknown }) => Promise<{
    data: any[];
    nextCursor?: unknown;
  }>;
  
  // Query key for caching
  queryKey: any[];
  
  // Render function for each item
  renderItem: (item: any, index: number) => React.ReactNode;
  
  // Initial page param
  initialPageParam?: unknown;
  
  // Get next page param from last page
  getNextPageParam?: (lastPage: any) => unknown;
  
  // Minimum distance from bottom to trigger load
  rootMargin?: string;
  
  // Custom loading component
  loadingComponent?: React.ReactNode;
  
  // Custom end component
  endComponent?: React.ReactNode;
  
  // Custom error component
  errorComponent?: (error: any, retry: () => void) => React.ReactNode;
  
  // Page size for prefetching
  pageSize?: number;
  
  // Enable/disable infinite scroll
  enabled?: boolean;
  
  // Class name for the container
  className?: string;
}

export function InfiniteScroll({
  queryFn,
  queryKey,
  renderItem,
  initialPageParam = 0,
  getNextPageParam = (lastPage) => lastPage?.nextCursor,
  rootMargin = '100px',
  loadingComponent,
  endComponent,
  errorComponent,
  pageSize = 20,
  enabled = true,
  className = '',
}: InfiniteScrollProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  // Set up the infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam,
    getNextPageParam,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle intersection observer
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (
      entry.isIntersecting &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchingRef.current &&
      enabled
    ) {
      isFetchingRef.current = true;
      fetchNextPage()
        .finally(() => {
          isFetchingRef.current = false;
        });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, enabled]);

  // Set up intersection observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold: 0,
    });

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, rootMargin]);

  // Flatten all pages of data
  const allItems = data?.pages.flatMap((page) => page.data) || [];

  // Status-based rendering
  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center py-12">
        {loadingComponent || (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Loading products...</span>
          </>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center py-12">
        {errorComponent ? (
          errorComponent(error, () => fetchNextPage())
        ) : (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load products</p>
            <Button onClick={() => fetchNextPage()} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render the content
  return (
    <div className={className}>
      {/* Items Grid/List */}
      <div className="min-h-[400px]">
        {allItems.map((item, index) => (
          <React.Fragment key={`${item.id}-${index}`}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-8">
          {loadingComponent || (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading more...</span>
            </>
          )}
        </div>
      )}

      {/* End of results */}
      {!hasNextPage && allItems.length > 0 && (
        <div className="flex items-center justify-center py-8">
          {endComponent || (
            <p className="text-gray-500 text-center">
              {allItems.length === pageSize 
                ? 'End of results' 
                : `Showing all ${allItems.length} items`
              }
            </p>
          )}
        </div>
      )}

      {/* Load more trigger element */}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={loadMoreRef} className="h-20" />
      )}
    </div>
  );
}

// Smart infinite scroll with intelligent loading
export function SmartInfiniteScroll({
  queryFn,
  queryKey,
  renderItem,
  ...props
}: Omit<InfiniteScrollProps, 'queryFn' | 'queryKey' | 'renderItem'> & {
  queryFn: (params: { pageParam?: unknown }) => Promise<{
    data: any[];
    nextCursor?: unknown;
  }>;
  queryKey: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  const [prefetchEnabled, setPrefetchEnabled] = React.useState(false);

  // Enable prefetching after initial load
  useEffect(() => {
    const timer = setTimeout(() => setPrefetchEnabled(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <InfiniteScroll
      queryFn={queryFn}
      queryKey={queryKey}
      renderItem={renderItem}
      enabled={props.enabled !== false && prefetchEnabled}
      {...props}
    />
  );
}

// Hook for creating infinite scroll configurations
export function useInfiniteScrollConfig(type: 'products' | 'categories') {
  switch (type) {
    case 'products':
      return {
        pageSize: 20,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        rootMargin: '200px',
      };
    
    case 'categories':
      return {
        pageSize: 12,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        rootMargin: '100px',
      };
    
    default:
      return {
        pageSize: 20,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        rootMargin: '100px',
      };
  }
}