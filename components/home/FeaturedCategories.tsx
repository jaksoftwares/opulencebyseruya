'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

  useEffect(() => {
    // Mock data - replace with actual Supabase call
    const mockCategories: Category[] = [
      { id: '1', name: 'Kitchen Ware', slug: 'kitchen-ware', description: 'Premium cooking essentials' },
      { id: '2', name: 'Home Decor', slug: 'home-decor', description: 'Elegant decorative pieces' },
      { id: '3', name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Luxury bath essentials' },
      { id: '4', name: 'Bedroom Essentials', slug: 'bedroom-essentials', description: 'Comfort & style' },
      { id: '5', name: 'Travel Essentials', slug: 'travel-essentials', description: 'Journey in style' },
      { id: '6', name: 'Kids Must-Have', slug: 'kids-must-have', description: 'Quality for little ones' },
      { id: '7', name: 'Gift Sets', slug: 'gift-sets', description: 'Perfect presents' },
      { id: '8', name: 'Storage & Organizers', slug: 'storage-organizers', description: 'Organized living' },
    ];
    setCategories(mockCategories);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium text-sm">Explore Our Collections</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover curated collections designed to elevate every corner of your home
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Package;
            const gradient = categoryColors[index % categoryColors.length];
            const isHovered = hoveredIndex === index;
            
            return (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="group relative h-full">
                  {/* Card */}
                  <div className={`
                    relative bg-white rounded-2xl p-6 h-full
                    border-2 border-gray-100
                    transition-all duration-500
                    ${isHovered ? 'shadow-2xl -translate-y-2 border-amber-200' : 'shadow-md hover:shadow-xl'}
                  `}>
                    {/* Icon Container */}
                    <div className={`
                      relative w-20 h-20 mx-auto mb-4 rounded-2xl
                      bg-gradient-to-br ${gradient}
                      flex items-center justify-center
                      transition-all duration-500
                      ${isHovered ? 'scale-110 rotate-6' : 'group-hover:scale-105'}
                      shadow-lg
                    `}>
                      <Icon className="h-10 w-10 text-white" />
                      
                      {/* Glow Effect */}
                      <div className={`
                        absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient}
                        opacity-0 blur-xl transition-opacity duration-500
                        ${isHovered ? 'opacity-50' : ''}
                      `} />
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className={`
                        font-bold text-lg mb-2 transition-colors duration-300
                        ${isHovered ? 'text-amber-600' : 'text-gray-900 group-hover:text-amber-600'}
                      `}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Hover Indicator */}
                    <div className={`
                      absolute bottom-4 left-1/2 transform -translate-x-1/2
                      text-xs font-semibold text-amber-600
                      transition-all duration-300
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}>
                      Explore →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">
              View All Categories
              <Sparkles className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { ChefHat, Plane, Baby, Bath, Home, Bed, Heart, Package, Sparkles, UtensilsCrossed, Luggage, Gift } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { supabase } from '@/lib/supabase';

// const categoryIcons: { [key: string]: any } = {
//   'kitchen-ware': ChefHat,
//   'travel-essentials': Plane,
//   'kids-must-have': Baby,
//   'bathroom-accessories': Bath,
//   'home-decor': Home,
//   'bedroom-essentials': Bed,
//   'health-wellness': Heart,
//   'storage-organizers': Package,
//   'cleaning-tools': Sparkles,
//   'serving-dining': UtensilsCrossed,
//   'storage-kitchen': Package,
//   'travel-lifestyle': Luggage,
//   'gift-sets': Gift,
// };

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
//   description: string;
// }

// export default function FeaturedCategories() {
//   const [categories, setCategories] = useState<Category[]>([]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const { data } = await supabase
//         .from('categories')
//         .select('*')
//         .eq('is_active', true)
//         .order('display_order')
//         .limit(8);

//       if (data) {
//         setCategories(data);
//       }
//     };

//     fetchCategories();
//   }, []);

//   return (
//     <section className="py-16 bg-white">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Shop by Category
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Explore our curated collection of premium products across various categories
//           </p>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {categories.map((category) => {
//             const Icon = categoryIcons[category.slug] || Package;
//             return (
//               <Link key={category.id} href={`/categories/${category.slug}`}>
//                 <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
//                   <CardContent className="p-6 text-center">
//                     <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
//                       <Icon className="h-8 w-8 text-amber-600" />
//                     </div>
//                     <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
//                       {category.name}
//                     </h3>
//                     <p className="text-sm text-gray-500 line-clamp-2">
//                       {category.description}
//                     </p>
//                   </CardContent>
//                 </Card>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }
