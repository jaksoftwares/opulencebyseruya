'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, ShoppingBag, Phone, Mail } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 py-20 px-8">
            <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10"></div>
            <div className="relative z-10">
              <div className="text-9xl font-bold text-white mb-4 opacity-20">404</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Page Not Found
              </h1>
              <p className="text-white/90 text-xl max-w-2xl mx-auto">
                Oops! The page you&apos;re looking for seems to have wandered off our shelves.
                Don&apos;t worry, let&apos;s get you back to shopping!
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* Illustration */}
            <div className="mb-12">
              <div className="text-8xl mb-4">🛍️</div>
              <p className="text-gray-600 text-lg">
                Our virtual shopping assistant couldn&apos;t find what you were looking for.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg">
                      <Home className="h-5 w-5" />
                      Go to Homepage
                    </Button>
                  </Link>

                  <Link href="/shop">
                    <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200">
                      <ShoppingBag className="h-5 w-5" />
                      Browse Products
                    </Button>
                  </Link>

                  <button
                    onClick={() => window.history.back()}
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Go Back
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <Link href="/contact">
                    <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200">
                      <Phone className="h-5 w-5" />
                      Contact Support
                    </Button>
                  </Link>

                  <Link href="/shop">
                    <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200">
                      <Search className="h-5 w-5" />
                      Search Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Electronics', href: '/categories/electronics', emoji: '📱' },
                  { name: 'Fashion', href: '/categories/fashion', emoji: '👕' },
                  { name: 'Home & Garden', href: '/categories/home-garden', emoji: '🏠' },
                  { name: 'Sports', href: '/categories/sports', emoji: '⚽' },
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="text-2xl mb-2">{category.emoji}</div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-amber-600">
                      {category.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Still need help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-medium">Email us</div>
                      <a href="mailto:info@opulencebyseruya.co.ke" className="text-amber-600 hover:underline">
                        info@opulencebyseruya.co.ke
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-medium">Call us</div>
                      <a href="tel:+254742617839" className="text-amber-600 hover:underline">
                        +254 742 617 839
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Opulence. All rights reserved. | Made with ❤️ for exceptional shopping experiences</p>
        </div>
      </div>
    </div>
  );
}