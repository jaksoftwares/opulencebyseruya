'use client';

import { Gift, Zap, Star, Truck, Shield, CreditCard } from 'lucide-react';
import Link from 'next/link';

const banners = [
  {
    id: 1,
    title: 'Mega Sale',
    subtitle: 'Up to 80% OFF',
    description: 'On electronics and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200',
    bgColor: 'from-blue-600 to-purple-600',
    textColor: 'text-white',
    link: '/shop?sale=mega'
  },
  {
    id: 2,
    title: 'Flash Deals',
    subtitle: 'Limited Time',
    description: 'Hurry before stock runs out!',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200',
    bgColor: 'from-red-600 to-orange-600',
    textColor: 'text-white',
    link: '/shop?deal=flash'
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Fresh Picks',
    description: 'Latest products just arrived',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200',
    bgColor: 'from-green-600 to-teal-600',
    textColor: 'text-white',
    link: '/shop?tag=new'
  }
];

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over KSh 5,000'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions'
  },
  {
    icon: CreditCard,
    title: 'Easy Returns',
    description: '30-day hassle-free returns'
  },
  {
    icon: Star,
    title: 'Quality Guarantee',
    description: 'Premium products only'
  }
];

export default function PromotionalBanners() {
  return (
    <div className="bg-white">
      {/* Main Promotional Banners */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${banner.bgColor} ${banner.textColor} p-6 min-h-[160px] flex flex-col justify-between relative`}>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    {banner.id === 1 && <Gift className="h-5 w-5" />}
                    {banner.id === 2 && <Zap className="h-5 w-5" />}
                    {banner.id === 3 && <Star className="h-5 w-5" />}
                    <span className="text-sm font-medium opacity-90">
                      {banner.id === 1 ? 'HOT DEAL' : banner.id === 2 ? 'FLASH SALE' : 'NEW'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                  <h4 className="text-2xl font-bold mb-2">{banner.subtitle}</h4>
                  <p className="text-sm opacity-90">{banner.description}</p>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                </div>
                
                {/* Shop Now Button */}
                <div className="relative z-10 mt-4">
                  <span className="inline-flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated!</h3>
            <p className="text-red-100 mb-6">
              Subscribe to our newsletter and get exclusive deals straight to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-red-200 mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}