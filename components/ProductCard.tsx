'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, Share2, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ProductImage, useImagePrefetcher } from '@/components/ui/OptimizedImage';

interface ProductCardProps {
   id: string;
   name: string;
   slug: string;
   price: number;
   compareAtPrice?: number;
   image: string;
   isInStock: boolean;
   isFeatured?: boolean;
   isTopDeal?: boolean;
   isNewArrival?: boolean;
   sku: string;
   rating?: number;
   reviews?: number;
 }

interface ProductDetails {
   id: string;
   name: string;
   slug: string;
   description: string;
   price: number;
   compare_at_price: number | null;
   sku: string;
   stock_quantity: number;
   images: string[];
   specifications: Record<string, any>;
   is_featured: boolean;
   is_top_deal: boolean;
   is_new_arrival: boolean;
   is_active: boolean;
   rating: number | null;
   reviews: number | null;
   badge: string | null;
   original_price: number | null;
   discount: number | null;
   sold_count: number | null;
   stock_left: number | null;
   tag: string | null;
   created_at: string;
   updated_at: string;
 }

export default function ProductCard({
   id,
   name,
   slug,
   price,
   compareAtPrice,
   image,
   isInStock,
   isFeatured,
   isTopDeal,
   isNewArrival,
   sku,
   rating = 4.5,
   reviews = 0,
 }: ProductCardProps) {
   const [isHovered, setIsHovered] = useState(false);
   const [quickViewOpen, setQuickViewOpen] = useState(false);
   const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
   const [loadingDetails, setLoadingDetails] = useState(false);
   const { addToCart } = useCart();
   const { toast } = useToast();
   const { prefetchImage } = useImagePrefetcher();

  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInStock) return;

    addToCart({
      id,
      name,
      price,
      image: image || '/placeholder-product.jpg',
      sku,
    });

    toast({
      title: 'Added to cart',
      description: `${name} has been added to your cart.`,
    });
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/products/${slug}`;
    const message = `Hi, I'm interested in ordering:\n\n*${name}*\nPrice: KES ${price.toLocaleString()}\nSKU: ${sku}\nProduct Link: ${productUrl}\n\nPlease provide more details.`;
    const whatsappUrl = `https://wa.me/254742617839?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleQuickView = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingDetails(true);
    setQuickViewOpen(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details.',
          variant: 'destructive',
        });
        setQuickViewOpen(false);
      } else {
        setProductDetails(data);
      }
    } catch (error) {
      console.error('Error in quick view:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details.',
        variant: 'destructive',
      });
      setQuickViewOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Added to Wishlist',
      description: `${name} has been added to your wishlist.`,
    });
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
      >
      {/* Image Container */}
      <Link href={`/products/${slug}`}>
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {image ? (
            <ProductImage
              src={image}
              alt={name}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              enableProgressive={true}
              lazy={true}
              onLoad={() => {
                // Prefetch related images for faster navigation
                prefetchImage(image, false);
              }}
              onError={() => {
                console.log('Image failed to load:', image);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <div className="text-center">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs">No Image</div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isFeatured && (
              <div className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                ⭐
              </div>
            )}
            {isTopDeal && (
              <div className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                🔥
              </div>
            )}
            {isNewArrival && (
              <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                ✨
              </div>
            )}
            {discount > 0 && (
              <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                -{discount}%
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <button
              onClick={handleWishlist}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickView}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-500 hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Stock Status Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white px-3 py-1 rounded text-sm font-medium">
                Out of Stock
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        {/* Rating */}
        {reviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-900 ml-1">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>
        )}

        {/* Product Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">
            KSh {price.toLocaleString()}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              KSh {compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isInStock && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          )}
          <Button
            onClick={handleWhatsAppOrder}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50 text-xs py-1.5 px-2"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </Button>
        </div>
      </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl">Quick View</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuickViewOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="ml-4 text-gray-600">Loading product details...</p>
            </div>
          ) : productDetails ? (
            <div className="space-y-6">
              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {productDetails.images && productDetails.images.length > 0 ? (
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={productDetails.images[0]}
                        alt={productDetails.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">No image available</p>
                    </div>
                  )}

                  {/* Thumbnail images */}
                  {productDetails.images && productDetails.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productDetails.images.slice(1, 5).map((img, index) => (
                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={img}
                            alt={`${productDetails.name} ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{productDetails.name}</h2>
                    <p className="text-gray-600 mb-4">{productDetails.description || 'No description available'}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        KES {productDetails.price.toLocaleString()}
                      </span>
                      {productDetails.compare_at_price && productDetails.compare_at_price > productDetails.price && (
                        <span className="text-lg text-gray-400 line-through">
                          KES {productDetails.compare_at_price.toLocaleString()}
                        </span>
                      )}
                      {productDetails.discount && (
                        <Badge className="bg-green-100 text-green-800">
                          {productDetails.discount}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        productDetails.stock_quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {productDetails.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                      {productDetails.stock_quantity > 0 && (
                        <span className="text-sm text-gray-600">
                          {productDetails.stock_quantity} units available
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {productDetails.rating && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">{productDetails.rating.toFixed(1)}</span>
                        </div>
                        {productDetails.reviews && (
                          <span className="text-gray-400 text-sm">({productDetails.reviews} reviews)</span>
                        )}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {productDetails.is_featured && (
                        <Badge className="bg-amber-100 text-amber-800">⭐ Featured</Badge>
                      )}
                      {productDetails.is_top_deal && (
                        <Badge className="bg-green-100 text-green-800">🔥 Top Deal</Badge>
                      )}
                      {productDetails.is_new_arrival && (
                        <Badge className="bg-blue-100 text-blue-800">✨ New Arrival</Badge>
                      )}
                      {productDetails.badge && (
                        <Badge variant="outline">{productDetails.badge}</Badge>
                      )}
                      {productDetails.tag && (
                        <Badge variant="secondary">{productDetails.tag}</Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {productDetails.stock_quantity > 0 && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: productDetails.id,
                                name: productDetails.name,
                                price: productDetails.price,
                                image: productDetails.images[0] || '',
                                sku: productDetails.sku,
                              });
                              toast({
                                title: 'Added to cart',
                                description: `${productDetails.name} has been added to your cart.`,
                              });
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              const productUrl = `${window.location.origin}/products/${productDetails.slug}`;
                              const message = `Hi, I'm interested in ordering:\n\n*${productDetails.name}*\nPrice: KES ${productDetails.price.toLocaleString()}\nSKU: ${productDetails.sku}\nProduct Link: ${productUrl}\n\nPlease provide more details.`;
                              const whatsappUrl = `https://wa.me/254742617839?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            variant="outline"
                            className="w-full border-green-500 text-green-600 hover:bg-green-50 py-3"
                          >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            Order via WhatsApp
                          </Button>
                        </>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setQuickViewOpen(false);
                            window.location.href = `/products/${productDetails.slug}`;
                          }}
                        >
                          View Full Details
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.share?.({
                              title: productDetails.name,
                              url: window.location.origin + `/products/${productDetails.slug}`
                            });
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>SKU:</span>
                        <span className="font-mono">{productDetails.sku}</span>
                      </div>
                      {productDetails.sold_count && (
                        <div className="flex justify-between">
                          <span>Sold:</span>
                          <span>{productDetails.sold_count} units</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Added:</span>
                        <span>{new Date(productDetails.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600">Failed to load product details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}