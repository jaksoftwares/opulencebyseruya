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
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4 backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 font-medium text-sm">Customer Reviews</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied customers who trust Opulence for their home essentials
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 opacity-20">
              <Quote className="h-16 w-16 text-amber-400" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-700 ${
                    index === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 absolute inset-0 translate-x-full'
                  }`}
                >
                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-xl md:text-2xl text-center mb-8 leading-relaxed font-light">
                    {testimonial.text}
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Star className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <div className="font-bold text-xl mb-1">{testimonial.name}</div>
                      <div className="text-amber-400 text-sm mb-1">{testimonial.location}</div>
                      <div className="text-gray-400 text-sm italic">
                        Purchased: {testimonial.product}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-12 h-3 bg-amber-400'
                    : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">10,000+</div>
            <div className="text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">4.9/5</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">500+</div>
            <div className="text-gray-400">Premium Products</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">100%</div>
            <div className="text-gray-400">Quality Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}