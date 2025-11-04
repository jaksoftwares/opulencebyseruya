'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Phone, RefreshCw, Truck, CheckCircle, XCircle, Clock, Package, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_method: string;
  delivery_county: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  notes?: string;
  order_items?: OrderItem[];
  payment?: Payment;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  phone_number: string;
  transaction_id?: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
  status: string;
  response_code?: string;
  response_description?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchOrders();
      }
    }
  }, [isAdmin, authLoading, router]);

  const fetchOrders = async (isRefresh = false) => {
    try {
      console.log('Fetching admin orders...');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Create admin client to bypass RLS
      const { createClient } = await import('@supabase/supabase-js');

      // Environment variables are available at build time, but let's check them
      const supabaseUrl = 'https://emgrqgsvjcdfqdvojizt.supabase.co';
      const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3JxZ3N2amNkZnFkdm9qaXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgxMDc5MywiZXhwIjoyMDc1Mzg2NzkzfQ.a_EbEfIOpz_S5x39XIJk0NPgFSYYMPu69_UoIrG7VIE';

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables');
        toast({
          title: 'Configuration Error',
          description: 'Missing Supabase configuration. Please check environment variables.',
          variant: 'destructive',
        });
        return;
      }

      const supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          order_number,
          customer_id,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          delivery_city,
          delivery_method,
          delivery_county,
          subtotal,
          delivery_fee,
          total,
          status,
          payment_method,
          payment_status,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            order_id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price,
            created_at
          ),
          payments (
            id,
            order_id,
            amount,
            phone_number,
            transaction_id,
            merchant_request_id,
            checkout_request_id,
            status,
            response_code,
            response_description,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error loading orders',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        });
      } else {
        console.log('Orders fetched successfully:', data?.length || 0, 'orders');
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error loading orders',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);

    // Order items are already included in the order data from the fetch
    if (order.order_items) {
      setOrderItems(order.order_items);
    } else {
      // Fallback: fetch order items separately if not included
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (data) setOrderItems(data);
    }
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Create admin client to bypass RLS for updates
      const { createClient } = await import('@supabase/supabase-js');

      // Environment variables are available at build time, but let's check them
      const supabaseUrl = 'https://emgrqgsvjcdfqdvojizt.supabase.co';
      const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3JxZ3N2amNkZnFkdm9qaXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgxMDc5MywiZXhwIjoyMDc1Mzg2NzkzfQ.a_EbEfIOpz_S5x39XIJk0NPgFSYYMPu69_UoIrG7VIE';

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables');
        toast({
          title: 'Configuration Error',
          description: 'Missing Supabase configuration. Please check environment variables.',
          variant: 'destructive',
        });
        return;
      }

      const supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Order status updated',
        description: `Order status changed to ${newStatus}`,
      });
      fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error updating status',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Orders</h1>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium font-mono text-sm">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {order.customer_phone}
                        </a>
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Order Number</h3>
                    <p className="text-lg font-mono text-gray-900">{selectedOrder.order_number}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Status</h3>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Payment Method</h3>
                    <p className="text-gray-900 capitalize">{selectedOrder.payment_method.replace('_', ' ')}</p>
                    <Badge variant={selectedOrder.payment_status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.delivery_address}</p>
                    <p><span className="font-medium">City:</span> {selectedOrder.delivery_city}</p>
                    <p><span className="font-medium">County:</span> {selectedOrder.delivery_county}</p>
                    <p><span className="font-medium">Delivery Method:</span> {selectedOrder.delivery_method}</p>
                  </div>
                </div>

                {/* Payment Information */}
                {selectedOrder.payment && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Details
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Transaction ID</p>
                          <p className="font-mono text-sm text-gray-900">
                            {selectedOrder.payment.transaction_id || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Amount</p>
                          <p className="font-semibold text-gray-900">
                            KES {selectedOrder.payment.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Phone Number</p>
                          <p className="text-sm text-gray-900">{selectedOrder.payment.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Payment Status</p>
                          <Badge
                            variant={selectedOrder.payment.status === 'completed' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {selectedOrder.payment.status}
                          </Badge>
                        </div>
                      </div>

                      {selectedOrder.payment.checkout_request_id && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Checkout Request ID</p>
                          <p className="font-mono text-xs text-gray-700 break-all">
                            {selectedOrder.payment.checkout_request_id}
                          </p>
                        </div>
                      )}

                      {selectedOrder.payment.response_description && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Response</p>
                          <p className="text-sm text-gray-700">{selectedOrder.payment.response_description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Initiated</p>
                          <p className="text-xs text-gray-600">
                            {new Date(selectedOrder.payment.created_at).toLocaleString('en-KE')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Last Updated</p>
                          <p className="text-xs text-gray-600">
                            {new Date(selectedOrder.payment.updated_at).toLocaleString('en-KE')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Payment Record */}
                {!selectedOrder.payment && selectedOrder.payment_method === 'mpesa' && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No payment record found for this order.</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Payment may have been made through alternative methods or records may be processing.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Product</TableHead>
                          <TableHead className="text-right font-semibold">Qty</TableHead>
                          <TableHead className="text-right font-semibold">Unit Price</TableHead>
                          <TableHead className="text-right font-semibold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              KES {item.unit_price.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              KES {item.total_price.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>KES {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
