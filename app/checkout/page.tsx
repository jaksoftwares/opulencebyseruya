'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, customer } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const deliveryFee = cartTotal >= 5000 ? 0 : 300;
  const total = cartTotal + deliveryFee;

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to place an order.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }
  }, [cart.length, router, user, toast]);

  // Pre-fill form with customer data if available
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: '',
        city: '',
        notes: '',
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to place an order.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Use API endpoint for order creation
      const orderData = {
        customer_id: customer?.id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        delivery_city: formData.city,
        subtotal: cartTotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        notes: formData.notes,
        items: cart,
      };

      console.log('Sending order data:', orderData);
      console.log('User ID from context:', user?.id);
      console.log('Customer ID from context:', customer?.id);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      clearCart();

      toast({
        title: 'Order placed successfully!',
        description: `Your order number is ${result.order.order_number}. We'll contact you shortly to confirm.`,
      });

      router.push(`/order-success?orderNumber=${result.order.order_number}&orderId=${result.order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error placing order',
        description: error instanceof Error ? error.message : 'Please try again or contact us via WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="0712345678"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="Street address, building, apartment"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Nairobi"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special instructions for delivery?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pay_on_delivery" id="pay_on_delivery" />
                        <Label htmlFor="pay_on_delivery" className="flex-1">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer">
                            <p className="font-medium text-blue-900 mb-2">Pay on Delivery</p>
                            <p className="text-sm text-blue-700">
                              Pay cash when your order is delivered to your doorstep.
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex-1">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer">
                            <p className="font-medium text-green-900 mb-2">M-Pesa Payment</p>
                            <p className="text-sm text-green-700">
                              After placing your order, our team will contact you with M-Pesa payment instructions.
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            KES {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>KES {cartTotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-gray-700">
                        <span>Delivery Fee</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <span className="text-green-600 font-medium">FREE</span>
                          ) : (
                            `KES ${deliveryFee.toLocaleString()}`
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>KES {total.toLocaleString()}</span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By placing your order, you agree to our terms and conditions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
