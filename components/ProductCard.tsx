'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isInStock: boolean;
  isFeatured?: boolean;
  sku: string;
  rating?: number;
  reviews?: number;
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
  sku,
  rating = 4.5,
  reviews = 0,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

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
    
    const message = `Hi, I'm interested in ordering:\n\n*${name}*\nPrice: KES ${price.toLocaleString()}\nSKU: ${sku}\n\nPlease provide more details.`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Quick View',
      description: 'Quick view feature coming soon!',
    });
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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Image Container */}
      <Link href={`/products/${slug}`}>
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isFeatured && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                ⭐ Featured
              </div>
            )}
            {discount > 0 && (
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                -{discount}%
              </div>
            )}
            {!isInStock && (
              <div className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-lg">
                Out of Stock
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            <button
              onClick={handleWishlist}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.share?.({ title: name, url: window.location.origin + `/products/${slug}` });
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Overlay CTA - Only show if in stock */}
          {isInStock && (
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <button
                onClick={handleAddToCart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mb-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Order via WhatsApp
              </button>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
                <p className="text-gray-900 font-bold text-lg">Out of Stock</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        {/* Rating */}
        {reviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">⭐</span>
              <span className="font-semibold text-sm">{rating}</span>
            </div>
            <span className="text-gray-400 text-xs">({reviews} reviews)</span>
          </div>
        )}

        {/* Product Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[56px]">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            KES {price.toLocaleString()}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              KES {compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* SKU */}
        <p className="text-xs text-gray-400 mt-2">SKU: {sku}</p>
      </div>
    </div>
  );
}