'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const heroSlides = [
  {
    title: "Luxury Living",
    subtitle: "for Every Home",
    description: "Transform your space with our curated collection of premium home essentials",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000",
    accent: "amber"
  },
  {
    title: "Elegant Living",
    subtitle: "Redefined",
    description: "Discover timeless pieces that blend sophistication with everyday comfort",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
    accent: "gold"
  },
  {
    title: "Curated Excellence",
    subtitle: "Delivered to You",
    description: "Experience the finest selection of home decor and lifestyle essentials",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000",
    accent: "amber"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative h-[42.5vh] min-h-[350px] sm:min-h-[400px] md:min-h-[450px] overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        {heroSlides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 animate-[zoomIn_20s_ease-out]"
              style={{
                backgroundImage: `url(${s.image})`,
                animation: idx === currentSlide ? 'zoomIn 20s ease-out forwards' : 'none',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white">
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6 animate-fadeIn">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            <span className="text-amber-400 font-medium tracking-wider uppercase text-xs sm:text-sm">
              Opulence by Seruya
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4 leading-tight animate-slideUp">
            {slide.title}
            <span className="block text-amber-400 mt-1 sm:mt-2">{slide.subtitle}</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed animate-slideUp animation-delay-200">
            {slide.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slideUp animation-delay-400">
            <Link href="/shop">
              <button className="group bg-amber-500 hover:bg-amber-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105 flex items-center justify-center gap-2">
                Explore Collection
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/categories">
              <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105">
                Shop by Category
              </button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-10 sm:mt-12 animate-slideUp animation-delay-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-amber-400">500+</div>
                <div className="text-sm sm:text-base text-gray-300">Premium Products</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-amber-400">10k+</div>
                <div className="text-sm sm:text-base text-gray-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-amber-400">100%</div>
                <div className="text-sm sm:text-base text-gray-300">Quality Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentSlide(idx);
              setIsAutoPlaying(false);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'w-8 sm:w-12 bg-amber-400'
                : 'w-4 sm:w-8 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes zoomIn {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </section>
  );
}
