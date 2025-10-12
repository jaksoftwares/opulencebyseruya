'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  'from-amber-500 to-orange-600',
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-emerald-600',
  'from-red-500 to-pink-600',
  'from-yellow-500 to-amber-600',
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-amber-50/30 relative overflow-hidden">
      {/* Decorative Backgrounds */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 rounded-full mb-3 sm:mb-4">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium text-xs sm:text-sm">
              Explore Our Collections
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-xl sm:max-w-2xl mx-auto text-base sm:text-lg">
            Discover curated collections designed to elevate every corner of your home.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-md animate-pulse"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-200 rounded-2xl"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mx-auto"></div>
              </div>
            ))
          ) : (
            categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Package;
              const gradient = categoryColors[index % categoryColors.length];
              const isHovered = hoveredIndex === index;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group"
                >
                  <div
                    className={`relative bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 transition-all duration-500
                    ${isHovered ? 'shadow-xl -translate-y-1 sm:-translate-y-2 border-amber-200' : 'shadow-md hover:shadow-lg'}
                    flex flex-col items-center text-center`}
                  >
                    {/* Icon */}
                    <div
                      className={`relative w-16 sm:w-20 h-16 sm:h-20 mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br ${gradient}
                      flex items-center justify-center transition-transform duration-500 ${isHovered ? 'scale-110 rotate-3' : 'group-hover:scale-105'} shadow-lg`}
                    >
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 blur-xl transition-opacity duration-500
                        ${isHovered ? 'opacity-40' : ''}`}
                      />
                    </div>

                    {/* Text */}
                    <h3
                      className={`font-semibold text-base sm:text-lg mb-1 sm:mb-2 transition-colors duration-300
                      ${isHovered ? 'text-amber-600' : 'text-gray-900 group-hover:text-amber-600'}`}
                    >
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Hover CTA */}
                    <div
                      className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-amber-600
                      transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    >
                      Explore →
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* View All */}
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 text-sm sm:text-base">
              View All Categories
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
