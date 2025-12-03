'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X, Grid3x3, LayoutGrid, ChevronDown, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
  sku: string;
  is_featured: boolean;
  category_id: string | null;
  is_top_deal?: boolean;
  is_new_arrival?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<4 | 5>(5);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching products from Supabase...');
        const [productsResponse, categoriesResponse] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('display_order'),
        ]);

        if (productsResponse.data) {
          console.log('✅ Products loaded:', productsResponse.data.length, 'products');
          setProducts(productsResponse.data);
          if (productsResponse.data.length > 0) {
            const maxPrice = Math.max(...productsResponse.data.map(p => p.price));
            setPriceRange([0, maxPrice]);
          }
        }
        
        if (categoriesResponse.data) {
          console.log('✅ Categories loaded:', categoriesResponse.data.length, 'categories');
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setShowOnlyInStock(false);
    setShowOnlyFeatured(false);
    const maxPrice = Math.max(...products.map(p => p.price));
    setPriceRange([0, maxPrice]);
  };

  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id || '')) {
        return false;
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Stock filter
      if (showOnlyInStock && product.stock_quantity === 0) {
        return false;
      }

      // Featured filter
      if (showOnlyFeatured && !product.is_featured) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'trending':
          return Math.random() - 0.5;
        case 'bestsellers':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const activeFiltersCount = 
    selectedCategories.length + 
    (showOnlyInStock ? 1 : 0) + 
    (showOnlyFeatured ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, priceRange, showOnlyInStock, showOnlyFeatured, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">All Products</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {loading ? 'Loading...' : `${filteredProducts.length} products found`}
                  {!loading && products.length > 0 && ` (${products.length} total)`}
                </p>
              </div>
              
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className={`w-64 ${showFilters ? 'block' : 'hidden lg:block'} flex-shrink-0`}>
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Search Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          className="mr-3"
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 flex-1"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Price Range
                  </h3>
                  <Slider
                    min={0}
                    max={Math.max(...products.map(p => p.price))}
                    step={500}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>KSh {priceRange[0].toLocaleString()}</span>
                    <span>KSh {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Quick Filters
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Checkbox
                        id="in-stock"
                        checked={showOnlyInStock}
                        onCheckedChange={(checked) => setShowOnlyInStock(checked as boolean)}
                        className="mr-3"
                      />
                      <label
                        htmlFor="in-stock"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        In Stock Only
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="featured"
                        checked={showOnlyFeatured}
                        onCheckedChange={(checked) => setShowOnlyFeatured(checked as boolean)}
                        className="mr-3"
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Featured Products
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Grid Size Toggle */}
                    <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded">
                      <button
                        onClick={() => setGridCols(4)}
                        className={`p-2 ${gridCols === 4 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGridCols(5)}
                        className={`p-2 ${gridCols === 5 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name">Name: A to Z</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="bestsellers">Bestsellers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          Search: {searchQuery}
                          <button onClick={() => setSearchQuery('')}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {selectedCategories.map((catId) => {
                        const category = categories.find(c => c.id === catId);
                        return (
                          <div key={catId} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {category?.name}
                            <button onClick={() => handleCategoryToggle(catId)}>
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      {showOnlyInStock && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          In Stock Only
                          <button onClick={() => setShowOnlyInStock(false)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {showOnlyFeatured && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          Featured Only
                          <button onClick={() => setShowOnlyFeatured(false)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                  <Button onClick={clearAllFilters} className="bg-blue-600 hover:bg-blue-700">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gridCols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
                    {currentProducts.map((product) => {
                      const rating = 4.0 + Math.random() * 1.0;
                      const reviews = Math.floor(Math.random() * 100) + 10;
                      const isTopDeal = Boolean(product.compare_at_price && product.compare_at_price > product.price);
                      const isNewArrival = Math.random() > 0.8;
                      
                      // Debug: Log product image URLs
                      console.log('Product image URLs:', {
                        productName: product.name,
                        images: product.images,
                        firstImage: product.images[0] || 'undefined'
                      });
                      
                      return (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          slug={product.slug}
                          price={product.price}
                          compareAtPrice={product.compare_at_price || undefined}
                          image={product.images[0] || ''}
                          isInStock={product.stock_quantity > 0}
                          isFeatured={product.is_featured}
                          isTopDeal={isTopDeal}
                          isNewArrival={isNewArrival}
                          sku={product.sku}
                          rating={rating}
                          reviews={reviews}
                        />
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-8 gap-1">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2"
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}