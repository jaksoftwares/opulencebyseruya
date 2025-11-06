'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Save, Package, Eye, CreditCard, Truck, CheckCircle, Clock, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function ProfilePage() {
  const { customer, user, refetchCustomer } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        phone: customer.phone || '',
      });

      // Fetch user orders
      fetchUserOrders();
    }
  }, [user, customer, router]);

  const fetchUserOrders = async () => {
    if (!customer?.id) return;

    try {
      setOrdersLoading(true);
      console.log('Fetching orders for customer ID:', customer.id);
      const response = await fetch(`/api/orders?customer_id=${customer.id}`);
      const data = await response.json();

      if (response.ok) {
        console.log('Orders fetched successfully:', data.orders?.length || 0, 'orders');
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.error);
        toast({
          title: 'Error loading orders',
          description: 'Failed to load your order history. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error loading orders',
        description: 'Failed to load your order history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return variants[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleCompletePayment = async (orderId: string) => {
    setPaymentOrderId(orderId);
    setPaymentPhoneNumber(customer?.phone || '');
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentOrderId || !paymentPhoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter your phone number for payment.',
        variant: 'destructive',
      });
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentOrderId,
          phoneNumber: paymentPhoneNumber,
          amount: orders.find(o => o.id === paymentOrderId)?.total || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate payment');
      }

      toast({
        title: 'Payment initiated!',
        description: result.message || 'Please check your phone for the M-Pesa prompt.',
      });

      setShowPaymentDialog(false);
      setPaymentOrderId(null);

      // Refresh orders to show updated payment status
      fetchUserOrders();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update using email since current schema doesn't link by auth user id
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('email', user?.email);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      // Refresh customer data
      await refetchCustomer();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/shop')}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Back to Shop
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-gray-600">Manage your profile and track your orders</p>
        </div>

        <Tabs defaultValue={typeof window !== 'undefined' && window.location.hash === '#orders' ? 'orders' : 'profile'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={customer.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Your account information and role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Account Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.role === 'admin' || customer.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.role === 'admin' || customer.role === 'super_admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Member Since:</span>
                    <span className="text-sm text-gray-600">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History
                </CardTitle>
                <CardDescription>
                  Track and manage your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2 text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.order_number}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusBadge(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </Badge>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                KES {order.total.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                              {order.payment_status === 'pending' && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Payment Pending
                                </Badge>
                              )}
                              {order.payment_status === 'completed' && (
                                <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                                  Payment Completed
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/orders/${order.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              {order.payment_status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCompletePayment(order.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Complete Payment
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details - {selectedOrder.order_number}</CardTitle>
                  <CardDescription>
                    Complete order information and items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusBadge(selectedOrder.status)}>
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1 capitalize">{selectedOrder.status}</span>
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {selectedOrder.payment_status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.order_items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.product_name} x {item.quantity}
                            </span>
                            <span className="font-medium">
                              KES {item.total_price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span>KES {selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                      Close Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Complete your payment for order #{orders.find(o => o.id === paymentOrderId)?.order_number}.
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
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Payment Amount: KES {orders.find(o => o.id === paymentOrderId)?.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-700">
                      You will receive an M-Pesa prompt on your phone to complete the payment.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPaymentDialog(false);
                        setPaymentOrderId(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={paymentLoading || !paymentPhoneNumber}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {paymentLoading ? 'Processing...' : 'Pay Now'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}