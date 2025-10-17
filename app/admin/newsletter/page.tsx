'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Users, Download, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function NewsletterAdmin() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchSubscribers();
      }
    }
  }, [isAdmin, authLoading, router]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscribers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        setSubscribers(subscribers.map(sub =>
          sub.id === id ? { ...sub, is_active: !currentStatus } : sub
        ));
        toast({
          title: 'Success',
          description: `Subscriber ${!currentStatus ? 'activated' : 'deactivated'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status',
        variant: 'destructive',
      });
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubscribers(subscribers.filter(sub => sub.id !== id));
        toast({
          title: 'Success',
          description: 'Subscriber deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive',
      });
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Status', 'Subscribed At', 'Unsubscribed At'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.is_active ? 'Active' : 'Inactive',
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && sub.is_active) ||
      (statusFilter === 'inactive' && !sub.is_active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter(sub => sub.is_active).length;
  const totalCount = subscribers.length;

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

  if (!isAdmin) {
    return null; // This will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading newsletter data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-gray-600 mt-2">Manage your newsletter subscribers</p>
        </div>
        <Button onClick={exportSubscribers} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalCount - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscribers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          <CardDescription>
            Manage your newsletter subscribers and their subscription status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed At</TableHead>
                <TableHead>Unsubscribed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                      {subscriber.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {subscriber.unsubscribed_at
                      ? new Date(subscriber.unsubscribed_at).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                      >
                        {subscriber.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subscribers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}