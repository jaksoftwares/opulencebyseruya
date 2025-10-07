import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Luxury Living for
            <span className="block text-amber-600">Every Home</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium kitchenware, elegant home decor, and lifestyle essentials that transform your house into a home of opulence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-6 text-lg">
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
    </section>
  );
}
