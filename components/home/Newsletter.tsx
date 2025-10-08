'use client';

import { useState } from 'react';
import { Mail, Send, Gift, Sparkles, Bell, Tag } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
    setEmail('');

    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const benefits = [
    { icon: Tag, text: 'Exclusive discounts up to 50%' },
    { icon: Gift, text: 'Early access to new products' },
    { icon: Bell, text: 'Special offers & promotions' },
    { icon: Sparkles, text: 'Home styling tips & tricks' }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-bounce-slow">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-orange-600 animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center text-white mb-10">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Join the Opulence Family
            </h2>
            <p className="text-xl text-white/90 mb-2">
              Subscribe now and get <span className="font-bold text-2xl">15% OFF</span> your first order!
            </p>
            <p className="text-white/80">
              Plus exclusive access to deals, new arrivals, and expert home styling tips
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl mb-10">
            {!isSubmitted ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all text-lg"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !email}
                    className="group px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe Now
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-white/70 text-sm text-center">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Opulence! 🎉</h3>
                <p className="text-white/90">Check your email for your 15% discount code</p>
              </div>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium leading-snug">
                    {benefit.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          <div className="mt-10 text-center">
            <p className="text-white/90 text-lg">
              Join <span className="font-bold text-2xl">10,000+</span> subscribers already enjoying exclusive benefits
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(20px);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-20px);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-10%);
          }
          50% {
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}



// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useToast } from '@/hooks/use-toast';

// export default function Newsletter() {
//   const [email, setEmail] = useState('');
//   const { toast } = useToast();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     toast({
//       title: 'Thank you for subscribing!',
//       description: 'You will receive updates about our latest products and offers.',
//     });

//     setEmail('');
//   };

//   return (
//     <section className="py-16 bg-gradient-to-br from-amber-600 to-amber-700 text-white">
//       <div className="container mx-auto px-4">
//         <div className="max-w-2xl mx-auto text-center">
//           <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
//             Stay Updated
//           </h2>
//           <p className="text-amber-100 mb-8">
//             Subscribe to our newsletter for exclusive offers, new arrivals, and home styling tips
//           </p>

//           <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
//             <Input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="bg-white text-gray-900 flex-1"
//             />
//             <Button type="submit" variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">
//               Subscribe
//             </Button>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// }
