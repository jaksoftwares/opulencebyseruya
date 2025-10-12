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
import { Search, SlidersHorizontal, X, Grid3x3, LayoutGrid, ChevronDown } from 'lucide-react';
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
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

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
        setProducts(productsResponse.data);
        const maxPrice = Math.max(...productsResponse.data.map(p => p.price));
        setPriceRange([0, maxPrice]);
      }
      if (categoriesResponse.data) setCategories(categoriesResponse.data);
      setLoading(false);
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
        default:
          return 0;
      }
    });

  const activeFiltersCount = 
    selectedCategories.length + 
    (showOnlyInStock ? 1 : 0) + 
    (showOnlyFeatured ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                Shop Premium Collection
              </h1>
              <p className="text-white/90 text-xl mb-8">
                Discover our curated selection of luxury home essentials crafted for elegance and comfort
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full shadow-xl border-0 focus:ring-4 focus:ring-white/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                    Categories
                    {selectedCategories.length > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        {selectedCategories.length}
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm text-gray-700 cursor-pointer hover:text-amber-600 transition-colors"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <Slider
                    min={0}
                    max={Math.max(...products.map(p => p.price))}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>KES {priceRange[0].toLocaleString()}</span>
                    <span>KES {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Filters</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-stock"
                      checked={showOnlyInStock}
                      onCheckedChange={(checked) => setShowOnlyInStock(checked as boolean)}
                    />
                    <label
                      htmlFor="in-stock"
                      className="text-sm text-gray-700 cursor-pointer hover:text-amber-600 transition-colors"
                    >
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={showOnlyFeatured}
                      onCheckedChange={(checked) => setShowOnlyFeatured(checked as boolean)}
                    />
                    <label
                      htmlFor="featured"
                      className="text-sm text-gray-700 cursor-pointer hover:text-amber-600 transition-colors"
                    >
                      Featured Products
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>

                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-900">{filteredProducts.length}</span> Products
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Grid Toggle */}
                    <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setGridCols(3)}
                        className={`p-2 rounded transition-colors ${
                          gridCols === 3 ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGridCols(4)}
                        className={`p-2 rounded transition-colors ${
                          gridCols === 4 ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="featured">Featured First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name">Name: A to Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                          Search: {searchQuery}
                          <button onClick={() => setSearchQuery('')}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {selectedCategories.map((catId) => {
                        const category = categories.find(c => c.id === catId);
                        return (
                          <div key={catId} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                            {category?.name}
                            <button onClick={() => handleCategoryToggle(catId)}>
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      {showOnlyInStock && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                          In Stock Only
                          <button onClick={() => setShowOnlyInStock(false)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {showOnlyFeatured && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
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
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                  <Button onClick={clearAllFilters} className="bg-amber-500 hover:bg-amber-600">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                  {filteredProducts.map((product) => (
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
                      sku={product.sku}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}