'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  product: string;
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Amina Hassan',
      location: 'Nairobi, Kenya',
      rating: 5,
      text: 'The quality of products from Opulence is absolutely exceptional! My kitchen has never looked better. The cookware set I purchased is not only beautiful but incredibly durable. Highly recommend!',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      product: 'Premium Cookware Set'
    },
    {
      id: 2,
      name: 'David Kamau',
      location: 'Mombasa, Kenya',
      rating: 5,
      text: 'Shopping with Opulence has been a game-changer for my home. Fast delivery, excellent customer service, and products that truly live up to their premium promise. Will definitely shop again!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      product: 'Home Decor Collection'
    },
    {
      id: 3,
      name: 'Grace Wanjiku',
      location: 'Kisumu, Kenya',
      rating: 5,
      text: 'I am in love with my new bathroom accessories! The attention to detail and luxurious feel is worth every shilling. Opulence has become my go-to for all home essentials.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
      product: 'Luxury Bath Set'
    },
    {
      id: 4,
      name: 'James Omondi',
      location: 'Nakuru, Kenya',
      rating: 5,
      text: 'From browsing to delivery, everything was seamless. The storage solutions I bought have transformed my home organization. Quality products at fair prices with excellent service!',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      product: 'Storage Organizers'
    },
    {
      id: 5,
      name: 'Sarah Njeri',
      location: 'Eldoret, Kenya',
      rating: 5,
      text: 'The customer service team went above and beyond to help me choose the perfect items for my new home. Every piece arrived perfectly packaged and exceeded my expectations!',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
      product: 'Bedroom Essentials'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 text-white relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full mb-3 backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Customer Reviews</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg">
            Trusted by thousands of happy customers across Kenya
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-10 border border-white/10 shadow-xl">
            <div className="absolute top-4 left-4 opacity-15">
              <Quote className="h-12 w-12 md:h-16 md:w-16 text-amber-400" />
            </div>

            <div className="relative z-10 min-h-[300px] md:min-h-[280px]">
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className={`transition-all duration-700 ${
                    i === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 absolute inset-0 translate-x-full'
                  }`}
                >
                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="h-5 w-5 md:h-6 md:w-6 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <blockquote className="text-center text-lg md:text-2xl font-light leading-relaxed mb-6">
                    {t.text}
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg">
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-white fill-white" />
                      </div>
                    </div>

                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-lg md:text-xl">{t.name}</div>
                      <div className="text-amber-400 text-sm mb-1">{t.location}</div>
                      <div className="text-gray-400 text-sm italic">
                        Purchased: {t.product}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <button
              onClick={prev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all rounded-full ${
                  i === currentIndex
                    ? 'w-10 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto text-center">
          {[
            ['10,000+', 'Happy Customers'],
            ['4.9/5', 'Customer Rating'],
            ['500+', 'Premium Products'],
            ['100%', 'Quality Guarantee'],
          ].map(([stat, label], i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stat}</div>
              <div className="text-gray-400 text-sm md:text-base">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
