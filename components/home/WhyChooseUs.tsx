'use client';

import { Truck, Shield, Phone, CreditCard, Award, Clock, HeartHandshake, Package2 } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Fast and reliable shipping to all corners of Kenya within 2-5 business days',
    color: 'from-blue-500 to-cyan-600',
    stat: '2-5 Days'
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Premium products with 100% satisfaction guarantee or your money back',
    color: 'from-green-500 to-emerald-600',
    stat: '100%'
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description: 'Always here to help via WhatsApp, call, or email whenever you need us',
    color: 'from-purple-500 to-pink-600',
    stat: '24/7'
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options including M-Pesa, card, and cash on delivery',
    color: 'from-amber-500 to-orange-600',
    stat: 'Safe'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Handpicked products from trusted brands and manufacturers worldwide',
    color: 'from-red-500 to-rose-600',
    stat: 'Certified'
  },
  {
    icon: Package2,
    title: 'Easy Returns',
    description: 'Hassle-free 14-day return policy if you are not completely satisfied',
    color: 'from-teal-500 to-cyan-600',
    stat: '14 Days'
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Orders processed and shipped within 24 hours on business days',
    color: 'from-indigo-500 to-blue-600',
    stat: '24 Hours'
  },
  {
    icon: HeartHandshake,
    title: 'Customer First',
    description: 'Your satisfaction is our priority with personalized service and care',
    color: 'from-pink-500 to-fuchsia-600',
    stat: '10k+'
  },
];

export default function WhyChooseUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium text-sm">Why Opulence</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Experience the Opulence Difference
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We&apos;re committed to providing exceptional service and premium quality in everything we do
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                {/* Card */}
                <div className={`
                  relative bg-white rounded-2xl p-6 h-full
                  border-2 transition-all duration-500
                  ${isHovered 
                    ? 'border-amber-300 shadow-2xl -translate-y-2' 
                    : 'border-gray-100 shadow-md hover:shadow-xl'
                  }
                `}>
                  {/* Icon with Gradient Background */}
                  <div className="relative mb-4">
                    <div className={`
                      w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                      flex items-center justify-center
                      transition-all duration-500
                      ${isHovered ? 'scale-110 rotate-6' : ''}
                      shadow-lg
                    `}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Stat Badge */}
                    <div className={`
                      absolute -top-2 -right-2
                      px-2 py-1 bg-gradient-to-r ${feature.color}
                      text-white text-xs font-bold rounded-full
                      shadow-lg transition-all duration-500
                      ${isHovered ? 'scale-110' : ''}
                    `}>
                      {feature.stat}
                    </div>

                    {/* Glow Effect */}
                    <div className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color}
                      opacity-0 blur-xl transition-opacity duration-500
                      ${isHovered ? 'opacity-30' : ''}
                    `} />
                  </div>

                  {/* Content */}
                  <h3 className={`
                    font-bold text-xl mb-3 transition-colors duration-300
                    ${isHovered ? 'text-amber-600' : 'text-gray-900'}
                  `}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom Accent */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl
                    bg-gradient-to-r ${feature.color}
                    transition-all duration-500
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">Premium Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                4.9/5
              </div>
              <div className="text-gray-600 font-medium">Customer Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Quality Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}




// import { Truck, Shield, Phone, CreditCard } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

// const features = [
//   {
//     icon: Truck,
//     title: 'Nationwide Delivery',
//     description: 'Fast and reliable shipping to all corners of Kenya',
//   },
//   {
//     icon: Shield,
//     title: 'Quality Guaranteed',
//     description: 'Premium products with satisfaction guarantee',
//   },
//   {
//     icon: Phone,
//     title: '24/7 Support',
//     description: 'Always here to help via WhatsApp or call',
//   },
//   {
//     icon: CreditCard,
//     title: 'Secure Payment',
//     description: 'Multiple payment options including M-Pesa',
//   },
// ];

// export default function WhyChooseUs() {
//   return (
//     <section className="py-16 bg-white">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Why Choose Opulence
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             We're committed to providing the best shopping experience
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {features.map((feature, index) => (
//             <Card key={index} className="border-2 hover:border-amber-300 transition-all duration-300">
//               <CardContent className="p-6 text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
//                   <feature.icon className="h-8 w-8 text-amber-600" />
//                 </div>
//                 <h3 className="font-semibold text-lg text-gray-900 mb-2">
//                   {feature.title}
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   {feature.description}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
