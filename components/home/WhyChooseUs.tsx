import { Truck, Shield, Phone, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Fast and reliable shipping to all corners of Kenya',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Premium products with satisfaction guarantee',
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description: 'Always here to help via WhatsApp or call',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options including M-Pesa',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Opulence
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best shopping experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-amber-300 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
