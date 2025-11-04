'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_county: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  created_at: string;
  notes?: string;
  order_items: Array<{
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, customer } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (customer?.phone) {
      setPaymentPhoneNumber(customer.phone);
    }

    fetchOrderDetails();
  }, [user, customer, params.id, router]);

  const fetchOrderDetails = async () => {
    if (!params.id || !customer?.id) return;

    try {
      setLoading(true);
      console.log('Fetching order details for ID:', params.id);

      const response = await fetch(`/api/orders?customer_id=${customer.id}&order_id=${params.id}`);
      const data = await response.json();

      if (response.ok && data.order) {
        console.log('Order details fetched successfully:', data.order);
        setOrder(data.order);
      } else {
        console.error('Failed to fetch order details:', data.error);
        toast({
          title: 'Error loading order',
          description: 'Failed to load order details. Please try again.',
          variant: 'destructive',
        });
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error loading order',
        description: 'Failed to load order details. Please try again.',
        variant: 'destructive',
      });
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    return variants[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };

    return variants[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleCompletePayment = async () => {
    if (!paymentPhoneNumber) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter your M-Pesa phone number.',
        variant: 'destructive',
      });
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus('processing');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?.id,
          phoneNumber: paymentPhoneNumber,
          amount: order?.total,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate payment');
      }

      toast({
        title: 'Payment Initiated!',
        description: 'Please check your phone for the M-Pesa payment prompt and complete the transaction.',
      });

      // Keep dialog open and show processing state
      // The dialog will stay open until callback confirms payment or user closes it

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 3000);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Poll for payment status updates when dialog is open and processing
  useEffect(() => {
    if (showPaymentDialog && paymentStatus === 'processing' && order?.id) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/status?orderId=${order.id}`);
          const result = await response.json();

          if (response.ok && result.payment) {
            if (result.payment.status === 'completed') {
              setPaymentStatus('completed');
              setPaymentCompleted(true);
              toast({
                title: 'Payment Completed Successfully!',
                description: 'Your payment has been processed and confirmed. Thank you!',
              });

              // Close dialog after showing success
              setTimeout(() => {
                setShowPaymentDialog(false);
                setPaymentStatus('idle');
                setPaymentCompleted(false);
                fetchOrderDetails(); // Refresh order details
              }, 3000);

              clearInterval(pollInterval);
            } else if (result.payment.status === 'failed') {
              setPaymentStatus('failed');
              toast({
                title: 'Payment Failed',
                description: 'The payment was not completed. Please try again.',
                variant: 'destructive',
              });
              setTimeout(() => {
                setPaymentStatus('idle');
              }, 3000);
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 5 minutes
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        if (paymentStatus === 'processing') {
          setPaymentStatus('idle');
          toast({
            title: 'Payment Timeout',
            description: 'Payment verification timed out. Please check your order status or try again.',
            variant: 'destructive',
          });
        }
      }, 300000); // 5 minutes

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [showPaymentDialog, paymentStatus, order?.id]);

  const handleCancelOrder = async () => {
    if (!order) return;

    // Only allow cancellation for pending orders
    if (order.status !== 'pending') {
      toast({
        title: 'Cannot Cancel Order',
        description: 'This order cannot be cancelled as it is already being processed.',
        variant: 'destructive',
      });
      return;
    }

    setCancellingOrder(true);

    try {
      // Create a server-side Supabase client
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
      });

      // Refresh order details
      fetchOrderDetails();

    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel order. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleContactSupport = () => {
    const message = `Hi, I need help with Order #${order?.order_number}. Can you assist me?`;
    const whatsappUrl = `https://wa.me/254742617839?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Order Not Found</h2>
            <p className="mt-2 text-gray-600">The order you are looking for does not exist or you do not have permission to view it.</p>
            <Button onClick={() => router.push('/profile')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order #{order.order_number}</p>
              </div>
            </div>
            <Badge className={`${getStatusBadge(order.status)} text-sm px-3 py-1`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          KES {item.total_price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          KES {item.unit_price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Delivery Method</Label>
                      <p className="text-gray-900 capitalize">{order.delivery_method}</p>
                    </div>
                    {order.delivery_method === 'delivery' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
                          <p className="text-gray-900">{order.delivery_address}</p>
                          <p className="text-gray-600 text-sm">{order.delivery_city}, {order.delivery_county}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {order.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Order Notes</Label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">KES {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">KES {order.delivery_fee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>KES {order.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Order Date</Label>
                    <p className="text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                    <p className="text-gray-900 capitalize">{order.payment_method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <Badge className={`${getPaymentStatusBadge(order.payment_status)} mt-1`}>
                      {order.payment_status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : order.payment_status === 'pending' ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      <span className="capitalize">{order.payment_status}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.payment_status === 'pending' && (
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}

                  {order.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={cancellingOrder}
                      className="w-full"
                    >
                      {cancellingOrder ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleContactSupport}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentCompleted ? 'Payment Completed!' : 'Complete Payment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentStatus === 'completed' ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your payment of KES {order.total.toLocaleString()} has been processed and confirmed.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Order #{order.order_number} is now fully paid.
                  </p>
                </div>
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Payment Initiated
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg text-left">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>STK Push sent to your phone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Waiting for you to complete payment...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Confirming payment receipt</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Check your phone and enter your M-Pesa PIN to complete the payment.
                  </p>
                  <p className="text-xs text-gray-500">
                    This dialog will automatically update once payment is confirmed.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPaymentDialog(false);
                        setPaymentStatus('idle');
                      }}
                      className="flex-1"
                    >
                      Close & Check Later
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPaymentStatus('idle')}
                      className="flex-1"
                    >
                      Try Different Number
                    </Button>
                  </div>
                </div>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-900">
                    Payment Not Completed
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg text-left">
                    <div className="space-y-2 text-sm text-red-800">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Payment was not received or timed out</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>M-Pesa PIN may not have been entered</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Insufficient funds or network issues</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Do not worry! You can try again with the same or different phone number.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPaymentStatus('idle')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPaymentDialog(false);
                        setPaymentStatus('idle');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Complete your payment for order #{order.order_number}.
                </p>

                <div>
                  <Label htmlFor="paymentPhone">M-Pesa Phone Number *</Label>
                  <Input
                    id="paymentPhone"
                    type="tel"
                    value={paymentPhoneNumber}
                    onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                    placeholder="0712345678 or +254712345678"
                    className="mt-1"
                    disabled={paymentLoading}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Payment Amount: KES {order.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700">
                    You will receive an M-Pesa prompt on your phone to complete the payment.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentDialog(false)}
                    className="flex-1"
                    disabled={paymentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCompletePayment}
                    disabled={paymentLoading || !paymentPhoneNumber}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}