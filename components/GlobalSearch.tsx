'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductSearch } from '@/hooks/api';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category_name?: string;
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Use debounce for search query to reduce API calls
  const debouncedSearchQuery = useDebounce(query, 300);
  
  // Enable search when there's a debounced query and search is open
  const shouldSearch = isOpen && !!debouncedSearchQuery.trim();
  
  // Use React Query for cached search results
  const { data: searchResults = [], isLoading: searchLoading } = useProductSearch(
    debouncedSearchQuery,
    shouldSearch
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('opulence-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('opulence-recent-searches', JSON.stringify(updated));
  };

  // Update debounced query when search opens
  useEffect(() => {
    if (isOpen) {
      setDebouncedQuery(query);
    }
  }, [query, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    saveRecentSearch(searchTerm);
    setIsOpen(false);
    setQuery('');
    router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('opulence-recent-searches');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <Button
        variant="ghost"
        size={className.includes('w-full') ? 'default' : 'icon'}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={className.includes('w-full') ? 'w-full justify-start gap-2' : 'hidden md:flex'}
      >
        <Search className="h-5 w-5" />
        {className.includes('w-full') && <span>Search products...</span>}
      </Button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-screen max-w-md bg-white rounded-2xl shadow-2xl border z-50 md:w-96">
          <div className="p-4">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 py-3 text-base rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </form>

            {/* Keyboard Shortcut Hint */}
            <div className="hidden md:flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to search</span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                to close
              </span>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchLoading && debouncedQuery && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}

            {!searchLoading && debouncedQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-600">No products found for &ldquo;{debouncedQuery}&rdquo;</p>
                <Button
                  onClick={() => handleSearch(query)}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Search in shop
                </Button>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="border-t">
                <div className="p-3 bg-gray-50 text-sm font-medium text-gray-700">
                  Products ({searchResults.length})
                </div>
                {searchResults.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      saveRecentSearch(query);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-amber-600">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {product.category_name && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    onClick={() => handleSearch(query)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </Button>
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="border-t">
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 text-left"
                  >
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {!query && recentSearches.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Start typing to search products</p>
                <p className="text-xs mt-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd> to open search
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
