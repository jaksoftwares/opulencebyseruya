import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ChefHat, Plane, Baby, Bath, Home, Bed, Heart, Package, Sparkles, UtensilsCrossed, Luggage, Gift } from 'lucide-react';

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
  image_url?: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export const revalidate = 60;

export default async function CategoriesPage() {
  const [categoriesRes, subcategoriesRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('subcategories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
  ]);

  const categories: Category[] = categoriesRes.data ?? [];
  const subcategories: Subcategory[] = subcategoriesRes.data ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-amber-50 to-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Categories
            </h1>
            <p className="text-gray-600 text-lg">
              Discover our curated collection organized by category
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="space-y-12">
              {/* Categories Section */}
              <div>
                <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category.slug] || Package;
                    const categorySubcategories = subcategories.filter(sc => sc.category_id === category.id);

                    return (
                      <Link key={category.id} href={`/categories/${category.slug}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden">
                          <CardContent className="p-0 text-center">
                            {/* Image Section - Top of Card */}
                            {category.image_url ? (
                              <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                  src={category.image_url}
                                  alt={category.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                {/* Optional overlay for better text contrast */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Icon className="h-16 w-16 text-white" />
                              </div>
                            )}

                            {/* Content Section */}
                            <div className="p-6">
                              <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-gray-600 leading-relaxed mb-3">
                                {category.description}
                              </p>
                              {categorySubcategories.length > 0 && (
                                <p className="text-sm text-amber-600 font-medium">
                                  {categorySubcategories.length} subcategory{categorySubcategories.length !== 1 ? 'ies' : 'y'}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Subcategories Section */}
              {subcategories.length > 0 && (
                <div>
                  <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">Browse by Subcategory</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subcategories.map((subcategory) => {
                      const category = categories.find(c => c.id === subcategory.category_id);
                      return (
                        <Link key={subcategory.id} href={`/categories/${category?.slug}?subcategory=${subcategory.slug}`}>
                          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-4 text-center">
                              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                                {subcategory.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {subcategory.description}
                              </p>
                              <p className="text-xs text-amber-600 font-medium">
                                {category?.name}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
