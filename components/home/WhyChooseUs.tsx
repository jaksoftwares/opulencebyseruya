'use client';

import {
  Truck,
  Shield,
  Phone,
  CreditCard,
  Award,
  Clock,
  HeartHandshake,
  Package2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description:
      'Fast and reliable shipping to all corners of Kenya within 2-5 business days',
    color: 'from-blue-500 to-cyan-600',
    stat: '2-5 Days',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description:
      'Premium products with 100% satisfaction guarantee or your money back',
    color: 'from-green-500 to-emerald-600',
    stat: '100%',
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description:
      'Always here to help via WhatsApp, call, or email whenever you need us',
    color: 'from-purple-500 to-pink-600',
    stat: '24/7',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description:
      'Multiple payment options including M-Pesa, card, and cash on delivery',
    color: 'from-amber-500 to-orange-600',
    stat: 'Safe',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description:
      'Handpicked products from trusted brands and manufacturers worldwide',
    color: 'from-red-500 to-rose-600',
    stat: 'Certified',
  },
  {
    icon: Package2,
    title: 'Easy Returns',
    description:
      'Hassle-free 14-day return policy if you are not completely satisfied',
    color: 'from-teal-500 to-cyan-600',
    stat: '14 Days',
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Orders processed and shipped within 24 hours on business days',
    color: 'from-indigo-500 to-blue-600',
    stat: '24 Hours',
  },
  {
    icon: HeartHandshake,
    title: 'Customer First',
    description:
      'Your satisfaction is our priority with personalized service and care',
    color: 'from-pink-500 to-fuchsia-600',
    stat: '10k+',
  },
];

export default function WhyChooseUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 rounded-full mb-4">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium text-xs sm:text-sm">
              Why Opulence
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Experience the Opulence Difference
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            We&apos;re committed to providing exceptional service and premium
            quality in everything we do
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div
                  className={`relative bg-white rounded-2xl p-5 sm:p-6 h-full border-2 transition-all duration-500
                    ${
                      isHovered
                        ? 'border-amber-300 shadow-2xl -translate-y-1 sm:-translate-y-2'
                        : 'border-gray-100 shadow-md hover:shadow-xl'
                    }`}
                >
                  {/* Icon */}
                  <div className="relative mb-3 sm:mb-4">
                    <div
                      className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                        flex items-center justify-center transition-all duration-500
                        ${isHovered ? 'scale-110 rotate-6' : ''}
                        shadow-lg`}
                    >
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>

                    {/* Stat Badge */}
                    <div
                      className={`absolute -top-2 -right-2 px-2 py-0.5 sm:py-1 bg-gradient-to-r ${feature.color}
                        text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg transition-all duration-500
                        ${isHovered ? 'scale-110' : ''}`}
                    >
                      {feature.stat}
                    </div>

                    {/* Glow */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color}
                        opacity-0 blur-xl transition-opacity duration-500
                        ${isHovered ? 'opacity-30' : ''}`}
                    />
                  </div>

                  {/* Content */}
                  <h3
                    className={`font-bold text-lg sm:text-xl mb-2 sm:mb-3 transition-colors duration-300
                      ${isHovered ? 'text-amber-600' : 'text-gray-900'}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Accent Line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.color}
                      transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-100">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                10,000+
              </div>
              <div className="text-gray-600 text-sm sm:text-base font-medium">
                Happy Customers
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                500+
              </div>
              <div className="text-gray-600 text-sm sm:text-base font-medium">
                Premium Products
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                4.9/5
              </div>
              <div className="text-gray-600 text-sm sm:text-base font-medium">
                Customer Rating
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                100%
              </div>
              <div className="text-gray-600 text-sm sm:text-base font-medium">
                Quality Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
