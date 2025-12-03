// Test if there's a specific issue with the ProductCard component
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const fetchData = async () => {
      try {
        console.log('🧪 Test: Fetching products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(3);
        
        if (error) {
          console.error('❌ Test: Error:', error);
          setError(error.message);
        } else {
          console.log('✅ Test: Success! Products:', data?.length);
          setProducts(data || []);
        }
      } catch (err) {
        console.error('❌ Test: Exception:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🔬 Product Test Page</h1>
        
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (
          <div>
            <p className="mb-4">
              Found <strong>{products.length}</strong> products
            </p>
            
            {products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">KSh {product.price.toLocaleString()}</p>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Images:</p>
                      <p className="text-xs">{product.images?.length || 0} images</p>
                      {product.images?.[0] && (
                        <p className="text-xs break-all">{product.images[0]}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <img 
                        src={product.images?.[0]} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          console.log('❌ Image failed to load:', product.images?.[0]);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', product.images?.[0]);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}