'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, UserCheck, UserX, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { isAdmin, customer } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchCustomers();
      }
    }
  }, [isAdmin, loading, customer, router]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCustomers(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (customerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: isActive })
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Customer ${isActive ? 'activated' : 'deactivated'}`,
      });

      fetchCustomers();

      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, is_active: isActive });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRoleUpdate = async (customerId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ role: newRole })
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: `Customer role changed to ${newRole}`,
      });

      fetchCustomers();

      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, role: newRole as any });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <CardTitle>Access Denied</CardTitle>
            <p className="text-gray-600">You don&spos;t have permission to access this page.</p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Customers</h1>
          <div className="text-sm text-gray-600">
            {customers.length} total customers
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-600 hover:text-green-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {customer.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">No phone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(customer.role || 'user')}>
                        {(customer.role || 'user').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(customer.id, !customer.is_active)}
                        >
                          {customer.is_active ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-gray-900 mt-1">{selectedCustomer.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900 mt-1">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-gray-900 mt-1">
                      {selectedCustomer.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Role</Label>
                    <Select
                      value={selectedCustomer.role}
                      onValueChange={(value) => handleRoleUpdate(selectedCustomer.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedCustomer.is_active ? 'default' : 'secondary'}>
                        {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Joined Date</Label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedCustomer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedCustomer.id, !selectedCustomer.is_active)}
                  >
                    {selectedCustomer.is_active ? 'Deactivate' : 'Activate'} Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}