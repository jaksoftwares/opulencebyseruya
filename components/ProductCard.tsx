'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
}: ProductCardProps) {
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

  return (
    <Link href={`/products/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
        <CardContent className="p-0 relative">
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {isFeatured && (
              <Badge className="absolute top-3 left-3 bg-amber-600">Featured</Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-3 right-3 bg-red-600">-{discount}%</Badge>
            )}
            {!isInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">Out of Stock</Badge>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start p-4 space-y-3">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-amber-600 transition-colors min-h-[3rem]">
            {name}
          </h3>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                KES {price.toLocaleString()}
              </span>
              {compareAtPrice && (
                <span className="text-sm text-gray-500 line-through">
                  KES {compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
