'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Phone, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const order = searchParams.get('orderNumber');
    const id = searchParams.get('orderId');
    setOrderNumber(order);
    setOrderId(id);

    if (id) {
      fetchOrderDetails(id);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrderDetails(order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />

              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">
                Order Placed Successfully!
              </h1>

              {orderNumber && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-900 mb-1">Your Order Number</p>
                  <p className="text-2xl font-bold text-amber-600">{orderNumber}</p>
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Thank you for your order! We&apos;ll contact you shortly via phone or WhatsApp to confirm your order and arrange payment.
              </p>

              {orderDetails && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium capitalize">{orderDetails.payment_method.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">KES {orderDetails.total.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Items Ordered:</p>
                      <div className="space-y-2">
                        {orderDetails.order_items?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>KES {item.total_price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <p className="text-gray-600">
                  Please keep your phone accessible. Our team will reach out within 1-2 hours during business hours.
                </p>

                <a href="https://wa.me/254742617839" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Us on WhatsApp
                  </Button>
                </a>

                <div className="pt-6 space-y-3">
                  <Link href="/shop">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
