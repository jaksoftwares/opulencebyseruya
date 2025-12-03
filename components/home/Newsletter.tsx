'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      console.log('Subscription successful:', data.message);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-red-600">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Mail className="h-6 w-6 text-white" />
            <h2 className="text-xl md:text-2xl font-bold text-white">GET EXCLUSIVE DEALS</h2>
          </div>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get <span className="font-bold">20% OFF</span> your next order
          </p>

          {!isSubmitted ? (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !email}
                className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-white font-semibold">✓ Check your email for your discount code!</p>
            </div>
          )}

          <p className="text-xs text-red-200 mt-3">
            By subscribing, you agree to receive marketing emails
          </p>
        </div>
      </div>
    </section>
  );
}
