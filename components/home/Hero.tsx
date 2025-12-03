'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, ArrowRight, Star, Gift, Zap } from 'lucide-react';
import InlineSearch from '@/components/InlineSearch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const heroSlides = [
  {
    title: "Shop Smart",
    subtitle: "Save More",
    description: "Discover amazing deals on thousands of products",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000",
    accent: "orange",
    badge: "Up to 70% OFF"
  },
  {
    title: "Flash Sales",
    subtitle: "Limited Time",
    description: "Incredible deals that won't last long",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000",
    accent: "red",
    badge: "Flash Deal"
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh Picks",
    description: "Latest products just for you",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2000",
    accent: "blue",
    badge: "New"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order')
        .limit(10);
      
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <div className="absolute inset-0 bg-white/90" />
      
      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
              <div className="bg-red-600 text-white px-4 py-3 font-semibold text-sm flex items-center gap-2">
                <Gift className="h-4 w-4" />
                SHOP BY CATEGORY
              </div>
              <div className="divide-y">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 hover:text-red-600 transition-colors flex items-center justify-between"
                  >
                    <span>{category.name}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="block px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm flex items-center justify-center gap-1"
                >
                  View All Categories
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6 h-full">
              {/* Left: Search & CTA */}
              <div className="flex flex-col justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-red-600 mb-2">🔥 FLASH SALE</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {slide.title}
                    </h1>
                    <p className="text-gray-600 text-sm">{slide.description}</p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <InlineSearch className="w-full" />
                  </div>
                  
                  {/* Quick Search Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Electronics', 'Fashion', 'Home', 'Sports'].map((tag) => (
                      <button
                        key={tag}
                        className="px-3 py-1 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-full text-xs transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promotional Banners */}
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/shop?deal=flash" className="group">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-medium">FLASH DEALS</span>
                      </div>
                      <div className="text-lg font-bold mb-1">Up to 80% OFF</div>
                      <div className="text-xs opacity-90">Limited time offers</div>
                    </div>
                  </Link>
                  <Link href="/shop?tag=new" className="group">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5" />
                        <span className="text-sm font-medium">NEW ARRIVALS</span>
                      </div>
                      <div className="text-lg font-bold mb-1">Fresh Picks</div>
                      <div className="text-xs opacity-90">Latest products daily</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Right: Featured Banner */}
              <div className="relative">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-6 text-white">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 w-fit">
                      {slide.badge}
                    </div>
                    <h2 className="text-xl font-bold mb-2">{slide.title} {slide.subtitle}</h2>
                    <p className="text-sm opacity-90 mb-4">{slide.description}</p>
                    <Link href="/shop">
                      <Button className="bg-white text-red-600 hover:bg-gray-100">
                        Shop Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">10,000+</div>
              <div className="text-xs text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">50,000+</div>
              <div className="text-xs text-gray-600">Customers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">100%</div>
              <div className="text-xs text-gray-600">Secure Payment</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">24/7</div>
              <div className="text-xs text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


