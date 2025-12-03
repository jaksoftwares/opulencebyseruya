'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChefHat, Plane, Baby, Bath, Home, Bed, Heart, Package,
  Sparkles, UtensilsCrossed, Luggage, Gift
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const categoryIcons: { [key: string]: any } = {
  'kitchen-ware': ChefHat,
  'travel-essentials': Plane,
  'kids-must-have': Baby,
  'bathroom-accessories': Bath,
  'home-decor': Home,
  'bedroom-essentials': Bed,
  'health-wellness': Heart,
  'storage-organizers': Package,
  'cleaning-tools': Sparkles,
  'serving-dining': UtensilsCrossed,
  'storage-kitchen': Package,
  'travel-lifestyle': Luggage,
  'gift-sets': Gift,
};

const categoryColors = [
  'from-red-500 to-orange-600',
  'from-red-600 to-pink-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-red-600',
  'from-red-400 to-red-600',
  'from-orange-400 to-red-500',
  'from-red-500 to-purple-600',
  'from-orange-500 to-pink-600',
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
          .limit(8);

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">SHOP BY CATEGORY</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
          <Link href="/categories" className="text-red-600 hover:text-red-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 text-center">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            ))
          ) : (
            categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Package;
              const gradient = categoryColors[index % categoryColors.length];

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Image/Icon Section */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-red-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
