'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface InlineSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function InlineSearch({ 
  placeholder = "Search for products...", 
  className = "",
  onSearch 
}: InlineSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12 py-3 text-base border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-lg"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        <Button 
          type="submit"
          className="absolute right-0 top-0 h-full px-6 bg-red-600 hover:bg-red-700 rounded-r-lg"
        >
          <Search className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>
    </div>
  );
}