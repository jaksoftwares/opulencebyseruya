'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChefHat, Plane, Baby, Bath, Home, Bed, Heart, Package, Sparkles, UtensilsCrossed, Luggage, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(8);

      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of premium products across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || Package;
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <Icon className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
