'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';

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
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsData) setProducts(productsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Category not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        <div className="bg-gradient-to-br from-amber-50 to-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              {category.description}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
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
      </main>
      <Footer />
    </div>
  );
}
