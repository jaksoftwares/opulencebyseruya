import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Users, Truck, Sparkles, Compass, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <span className="text-sm font-medium text-amber-100">Where Grace Meets Design</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
                Opulence by Seruya
              </h1>
              <p className="text-xl md:text-2xl text-amber-100 leading-relaxed font-light">
                A lifestyle brand inspired by the beauty of excellence, faith, and divine provision
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-8"></div>
            </div>

            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p className="text-xl text-center italic text-amber-900 font-light mb-8">
                &apos;Born from a heart that believes in elegance with purpose&quote;
              </p>
              
              <p>
                Welcome to Opulence by Seruya, where every piece tells a story of grace and intentionality. We are more than an e-commerce destination — we are a celebration of the abundant life, reflected in the spaces we call home.
              </p>

              <p>
                Our journey began with a simple yet profound belief: that the items we surround ourselves with should inspire, uplift, and remind us of life&apos;s blessings. We offer thoughtfully curated pieces that elevate your space — blending timeless design with everyday function.
              </p>

              <p>
                Each item you see here carries a touch of grace — reminding you that abundance is not just what you have, but what you embody. From premium kitchenware to elegant home decor, we believe every detail matters in creating a sanctuary that reflects your values and aspirations.
              </p>
            </div>
          </div>
        </div>

        {/* Our Philosophy */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Philosophy</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-4 text-gray-900">Excellence with Purpose</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We believe that beauty and function are not separate pursuits. Every product we choose reflects excellence that serves a meaningful purpose in your daily life.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-4 text-gray-900">Grace in Every Detail</h3>
                    <p className="text-gray-600 leading-relaxed">
                      From curation to delivery, we infuse grace into every touchpoint. Your experience with us should feel as elevated as the products you receive.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Compass className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-4 text-gray-900">Abundance Embodied</h3>
                    <p className="text-gray-600 leading-relaxed">
                      True opulence is not about accumulation, but about cherishing quality over quantity. We help you build a home filled with pieces you truly love.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Our Commitments */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Promise to You</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Curated Excellence</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Every product is hand-selected and rigorously tested to ensure it meets our premium standards of quality and design
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Heartfelt Service</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Your satisfaction and joy are at the heart of everything we do. We&apos;re here to support you every step of the way
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Community of Grace</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Join a growing family of discerning homemakers who value quality, beauty, and purposeful living
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Reliable Delivery</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        We deliver to all corners of Kenya with care, ensuring your precious items arrive safely at your doorstep
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Instagram Feed Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                Experience the Lifestyle
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Follow our journey on Instagram for daily inspiration, styling tips, and glimpses into homes transformed by grace and elegance
              </p>
            </div>

            {/* Instagram Grid Placeholder */}
            <div className="max-w-6xl mx-auto mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="aspect-square bg-gradient-to-br from-amber-900/20 to-amber-800/20 rounded-lg overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <Star className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-amber-400/30 text-6xl font-serif">S</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instagram CTA */}
            <div className="text-center">
              <a 
                href="https://www.instagram.com/opulencebyseruya_?igsh=MTN0YTJpem5icnZqYQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow @opulencebyseruya
              </a>
              <p className="text-gray-400 text-sm mt-4">Join our community of 10,000+ inspired homemakers</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 rounded-2xl p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              <div className="relative z-10">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                  Begin Your Journey
                </h3>
                <p className="text-amber-50 text-lg mb-8 max-w-2xl mx-auto">
                  Transform your space with pieces that carry grace. Discover our curated collection of premium home essentials designed to elevate your everyday living.
                </p>
                <a 
                  href="/shop" 
                  className="inline-block bg-white hover:bg-gray-50 text-amber-600 font-semibold px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Explore Our Collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}