'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: 'Thank you for subscribing!',
      description: 'You will receive updates about our latest products and offers.',
    });

    setEmail('');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-amber-600 to-amber-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-amber-100 mb-8">
            Subscribe to our newsletter for exclusive offers, new arrivals, and home styling tips
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white text-gray-900 flex-1"
            />
            <Button type="submit" variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
