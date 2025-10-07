'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const admin = await getCurrentAdmin();
      if (!admin) {
        router.push('/admin');
        return;
      }

      const [productsRes, ordersRes, revenueRes, pendingRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('orders').select('total'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const revenue = revenueRes.data?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue: revenue,
        pendingOrders: pendingRes.count || 0,
      });

      setLoading(false);
    };

    checkAuth();
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                KES {stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Orders
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/products" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove products from your catalog</p>
              </a>
              <a href="/admin/orders" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-1">View Orders</h3>
                <p className="text-sm text-gray-600">Process and manage customer orders</p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Platform</span>
                <span className="font-medium">Opulence by Seruya</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Active Products</span>
                <span className="font-medium">{stats.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Online
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
