'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  RefreshCw,
  CreditCard,
  DollarSign,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  payment_id: string;
  order_id: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
  response_code?: string;
  response_description?: string;
  customer_message?: string;
  result_code?: string;
  result_desc?: string;
  callback_metadata?: any;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number: string;
  amount: number;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const fetchPayments = async (isRefresh = false) => {
    try {
      console.log('Fetching admin payments...');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      console.log('Payments fetched successfully:', data?.length || 0, 'payments');
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error loading payments',
        description: 'Failed to load payments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchPayments();
    }
  }, [isAdmin, authLoading]);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchPayments(true);
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: paymentId,
          status: newStatus,
          updated_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      toast({
        title: 'Payment status updated',
        description: `Payment status changed to ${newStatus}`,
      });
      fetchPayments();

      if (selectedPayment && selectedPayment.payment_id === paymentId) {
        setSelectedPayment({ ...selectedPayment, status: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error updating status',
        description: error.message || 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone_number.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      const diffTime = now.getTime() - paymentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          return diffDays <= 1;
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (authLoading) {
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
          <h1 className="font-serif text-3xl font-bold text-gray-900">Payments</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchPayments(false)}
              disabled={loading}
              variant="default"
              className="flex items-center gap-2"
            >
              {loading ? 'Loading...' : 'Load Payments'}
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || payments.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Receipt Number, Order #, Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {loading ? 'Loading payments...' : payments.length === 0 ? 'No payments loaded. Click "Load Payments" to fetch payments.' : 'No payments match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.payment_id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {payment.mpesa_receipt_number || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.order_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customer_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{payment.customer_email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-green-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {payment.phone_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString('en-KE', {
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
                          onClick={() => handleViewPayment(payment)}
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

        {/* Payment Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Payment ID</h3>
                    <p className="text-lg font-mono text-gray-900 text-sm">{selectedPayment.payment_id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Status</h3>
                    <Select
                      value={selectedPayment.status}
                      onValueChange={(value) => handleStatusUpdate(selectedPayment.payment_id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-600 mb-1">Amount</h3>
                    <p className="text-lg font-bold text-gray-900">KES {selectedPayment.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Information */}
                {(selectedPayment.order_number || selectedPayment.customer_name) && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium">Order Number:</span> {selectedPayment.order_number || 'N/A'}</p>
                      <p><span className="font-medium">Customer:</span> {selectedPayment.customer_name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedPayment.customer_email || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedPayment.customer_phone || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Payment Details</h3>
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">M-Pesa Receipt Number</p>
                        <p className="font-mono text-sm text-gray-900">
                          {selectedPayment.mpesa_receipt_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Phone Number</p>
                        <p className="text-sm text-gray-900">{selectedPayment.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Transaction Date</p>
                        <p className="text-sm text-gray-900">
                          {selectedPayment.transaction_date ? new Date(selectedPayment.transaction_date).toLocaleString('en-KE') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Merchant Request ID</p>
                        <p className="font-mono text-xs text-gray-700 break-all">
                          {selectedPayment.merchant_request_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Checkout Request ID</p>
                        <p className="font-mono text-xs text-gray-700 break-all">
                          {selectedPayment.checkout_request_id || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Result Code</p>
                        <p className="text-sm text-gray-900">{selectedPayment.result_code || 'N/A'}</p>
                      </div>
                    </div>

                    {selectedPayment.result_desc && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Result Description</p>
                        <p className="text-sm text-gray-700">{selectedPayment.result_desc}</p>
                      </div>
                    )}

                    {selectedPayment.customer_message && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Customer Message</p>
                        <p className="text-sm text-gray-700">{selectedPayment.customer_message}</p>
                      </div>
                    )}

                    {selectedPayment.callback_metadata && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Callback Metadata</p>
                        <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(selectedPayment.callback_metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Initiated</p>
                        <p className="text-xs text-gray-600">
                          {new Date(selectedPayment.created_at).toLocaleString('en-KE')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Last Updated</p>
                        <p className="text-xs text-gray-600">
                          {new Date(selectedPayment.updated_at).toLocaleString('en-KE')}
                        </p>
                      </div>
                    </div>
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