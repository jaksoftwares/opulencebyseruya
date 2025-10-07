'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Truck, Shield, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
  sku: string;
  specifications: any;
  is_featured: boolean;
  category_id: string | null;
}

interface Category {
  name: string;
  slug: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (productData) {
        setProduct(productData);

        if (productData.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', productData.category_id)
            .maybeSingle();

          if (categoryData) setCategory(categoryData);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        sku: product.sku,
      });
    }

    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} added to your cart.`,
    });

    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {category && (
                <div className="text-sm text-amber-600 font-medium">
                  {category.name}
                </div>
              )}

              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 mb-4">
                  {product.is_featured && (
                    <Badge className="bg-amber-600">Featured</Badge>
                  )}
                  {product.stock_quantity > 0 ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Out of Stock
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge variant="destructive">Save {discount}%</Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    KES {product.price.toLocaleString()}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-gray-500 line-through">
                      KES {product.compare_at_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </div>
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Specifications</h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </dt>
                          <dd className="font-medium text-gray-900">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                             Array.isArray(value) ? value.join(', ') : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="px-6 py-2 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>

                  <a href="https://wa.me/254742617839" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-2">
                      <Phone className="mr-2 h-5 w-5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-700">Free delivery on orders above KES 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-700">Quality guarantee and easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-700">Call/WhatsApp: 0742 617 839</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
