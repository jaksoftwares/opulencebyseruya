import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debouncing callbacks
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(timer);
    };

    return func as T;
  }, [callback, delay, debounceTimer]);

  return debouncedCallback;
}

/**
 * Hook for debouncing async operations
 * @param asyncCallback - The async callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced async callback with loading state
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T,
  delay: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(0);

  const debouncedAsyncCallback = useMemo(() => {
    const func = async (...args: Parameters<T>) => {
      const currentTime = Date.now();
      const timeSinceLastCall = currentTime - lastCallTime;

      if (timeSinceLastCall < delay) {
        // Wait for the remaining delay time
        await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastCall));
      }

      setIsLoading(true);
      setLastCallTime(Date.now());

      try {
        return await asyncCallback(...args);
      } finally {
        setIsLoading(false);
      }
    };

    return func;
  }, [asyncCallback, delay, lastCallTime]);

  return {
    debouncedAsyncCallback,
    isLoading,
    lastCallTime,
  };
}