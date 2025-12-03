'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart, Truck, Shield, Phone, Heart, Share2,
  Star, ChevronLeft, ChevronRight, Check, Package,
  RefreshCw, Clock, MapPin, Minus, Plus, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';

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

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

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

          // Fetch related products from the same category
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .neq('id', productData.id)
            .eq('is_active', true)
            .limit(12);

          if (relatedData) setRelatedProducts(relatedData);
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

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${product.slug}`;
    const message = `Hi, I'm interested in ordering:\n\n*${product.name}*\nPrice: KES ${product.price.toLocaleString()}\nQuantity: ${quantity}\nSKU: ${product.sku}\nProduct Link: ${productUrl}\n\nPlease provide more details about delivery and payment.`;
    const whatsappUrl = `https://wa.me/254742617839?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} on Opulence by Seruya`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Product link copied to clipboard.',
      });
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      description: isWishlisted
        ? `${product?.name} removed from your wishlist.`
        : `${product?.name} added to your wishlist.`,
    });
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailRef.current) {
      const scrollAmount = 80;
      const newScrollLeft = direction === 'left' 
        ? thumbnailRef.current.scrollLeft - scrollAmount
        : thumbnailRef.current.scrollLeft + scrollAmount;
      
      thumbnailRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/shop">
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Home className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/shop" className="hover:text-red-600 transition-colors">Shop</Link>
              {category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link href={`/categories/${category.slug}`} className="hover:text-red-600 transition-colors">
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Product Images - Compact */}
            <div className="lg:col-span-1">
              {/* Main Image */}
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm mb-2">
                <div className="aspect-square relative">
                  {product.images[selectedImage] ? (
                    <Image
                      src={product.images[selectedImage]}
                      alt={`${product.name} - Image ${selectedImage + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1 py-0">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-xs">
                    {selectedImage + 1}/{product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery - Horizontal Scrollable */}
              {hasMultipleImages && (
                <div className="relative">
                  <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border transition-all ${
                          selectedImage === index ? 'border-red-500' : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Scroll arrows */}
                  {product.images.length > 4 && (
                    <>
                      <button
                        onClick={() => scrollThumbnails('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-r p-1 opacity-0 hover:opacity-100 transition-opacity z-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => scrollThumbnails('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-l p-1 opacity-0 hover:opacity-100 transition-opacity z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Product Info - Compact */}
            <div className="lg:col-span-2 space-y-3">
              {/* Category & Title */}
              <div className="space-y-1">
                {category && (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-red-600 font-medium hover:text-red-700 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                )}
                <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">(24 reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-bold text-red-600">
                    KSh {product.price.toLocaleString()}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm text-gray-500 line-through">
                      KSh {product.compare_at_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock & Quantity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.stock_quantity > 0 ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Check className="h-2 w-2 mr-1" />
                      In Stock ({product.stock_quantity})
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 text-xs">Out of Stock</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Qty:</span>
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-6 w-6"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="px-2 py-1 font-medium min-w-[40px] text-center text-xs">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="h-6 w-6"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white h-10 text-sm"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  Add to Cart
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white h-10 text-sm"
                  onClick={handleWhatsAppOrder}
                >
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className="flex-1 h-8 text-xs"
                >
                  <Heart className={`mr-1 h-3 w-3 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-8 px-4"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Product Details Tabs */}
              <div className="bg-gray-50 rounded-lg border overflow-hidden">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                      value="description"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent px-3 py-2 text-sm"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="specifications"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent px-3 py-2 text-sm"
                    >
                      Specs
                    </TabsTrigger>
                    <TabsTrigger
                      value="delivery"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent px-3 py-2 text-sm"
                    >
                      Delivery
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-4">
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {product.description}
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="p-4">
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 p-2 bg-white rounded text-sm border">
                            <Check className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-gray-600">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                               Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No specifications available.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="delivery" className="p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <Truck className="h-4 w-4" />
                        <span>Fast delivery within Nairobi</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>24-48 hours nationwide</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-700">
                        <RefreshCw className="h-4 w-4" />
                        <span>Easy returns within 48 hours</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>



          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">RELATED PRODUCTS</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                <Link href={`/categories/${category?.slug}`} className="text-red-600 hover:text-red-700 font-medium text-sm">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {relatedProducts.slice(0, 18).map((relatedProduct) => {
                  const discount = relatedProduct.compare_at_price
                    ? Math.round(((relatedProduct.compare_at_price - relatedProduct.price) / relatedProduct.compare_at_price) * 100)
                    : 0;

                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/products/${relatedProduct.slug}`}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <Image
                          src={relatedProduct.images[0] || ''}
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            -{discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-red-600">
                            KSh {relatedProduct.price.toLocaleString()}
                          </span>
                          {relatedProduct.compare_at_price && (
                            <span className="text-xs text-gray-400 line-through">
                              KSh {relatedProduct.compare_at_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}