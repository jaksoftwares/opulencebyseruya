'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Phone, Mail, MapPin, Building, Package, Users, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contact_person: string;
  website: string;
  payment_terms: string;
  credit_limit: number;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  purchase_price: number;
  quantity_supplied: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

function AddProductToSupplierForm({ supplierId, products, supplierProducts, onSuccess }: { supplierId: string; products: Product[]; supplierProducts: SupplierProduct[]; onSuccess: () => void }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantitySupplied, setQuantitySupplied] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/supplier-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: supplierId,
          product_id: selectedProductId,
          purchase_price: parseFloat(purchasePrice),
          quantity_supplied: parseInt(quantitySupplied),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setSelectedProductId('');
      setPurchasePrice('');
      setQuantitySupplied('');
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableProducts = products.filter(p => !supplierProducts.some(sp => sp.product_id === p.id && sp.supplier_id === supplierId));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product">Product *</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} (SKU: {product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="purchase_price">Purchase Price (KES) *</Label>
          <Input
            id="purchase_price"
            type="number"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="quantity_supplied">Quantity Supplied *</Label>
        <Input
          id="quantity_supplied"
          type="number"
          value={quantitySupplied}
          onChange={(e) => setQuantitySupplied(e.target.value)}
          placeholder="0"
          required
        />
      </div>
      <Button type="submit" disabled={loading || !selectedProductId || !purchasePrice || !quantitySupplied}>
        {loading ? 'Adding...' : 'Add Product'}
      </Button>
    </form>
  );
}

export default function AdminSuppliersPage() {
  const router = useRouter();
  const { isAdmin, customer, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [supplierProductsDialogOpen, setSupplierProductsDialogOpen] = useState(false);
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contact_person: '',
    website: '',
    payment_terms: '',
    credit_limit: '',
    is_active: true,
    notes: '',
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      console.log('Fetching suppliers...');

      // First try with direct API call to bypass any client-side RLS issues
      const res = await fetch('/api/admin/suppliers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      console.log('Suppliers loaded via API:', data.length, 'items');
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Failed to load suppliers:', error);

      // Fallback to direct Supabase query if API fails
      try {
        console.log('Trying direct Supabase query...');
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Suppliers query error:', error);
          throw error;
        }

        console.log('Suppliers loaded via Supabase:', data?.length || 0, 'items');
        setSuppliers(data || []);
      } catch (supabaseError: any) {
        console.error('Both API and Supabase queries failed:', supabaseError);
        toast({
          title: 'Error Loading Suppliers',
          description: `Failed to load suppliers: ${supabaseError.message}. This might be due to database permissions or table not existing.`,
          variant: 'destructive',
        });
        setSuppliers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSupplierProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/supplier-products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setSupplierProducts(data || []);
    } catch (error: any) {
      console.error('Failed to load supplier products:', error);
      setSupplierProducts([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && customer) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchSuppliers();
        fetchSupplierProducts();
        fetchProducts();
      }
    }
  }, [isAdmin, authLoading, customer, router, fetchSuppliers, fetchSupplierProducts, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build supplierData strictly matching Supabase schema
      const supplierData: any = {
        name: formData.name,
        company_name: formData.company_name || '',
        email: formData.email,
        phone: formData.phone,
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || '',
        contact_person: formData.contact_person || '',
        website: formData.website || '',
        payment_terms: formData.payment_terms || '',
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
        is_active: !!formData.is_active,
        notes: formData.notes || '',
      };

      const method = editingSupplier ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSupplier ? { ...supplierData, id: editingSupplier.id } : supplierData),
      });

      if (!res.ok) throw new Error(await res.text());

      toast({
        title: editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully',
        description: 'Supplier information has been saved.',
        variant: 'default'
      });

      setDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      company_name: supplier.company_name || '',
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      contact_person: supplier.contact_person || '',
      website: supplier.website || '',
      payment_terms: supplier.payment_terms || '',
      credit_limit: supplier.credit_limit ? supplier.credit_limit.toString() : '',
      is_active: supplier.is_active,
      notes: supplier.notes || '',
    });
    setDialogOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setViewDialogOpen(true);
  };

  const handleManageProducts = (supplier: Supplier) => {
    setSelectedSupplierForProducts(supplier);
    setSupplierProductsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: 'Supplier deleted successfully',
        description: 'The supplier has been removed from the system.',
        variant: 'default'
      });
      fetchSuppliers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      contact_person: '',
      website: '',
      payment_terms: '',
      credit_limit: '',
      is_active: true,
      notes: '',
    });
    setEditingSupplier(null);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <CardTitle>Access Denied</CardTitle>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.filter(s => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {suppliers.filter(s => supplierProducts.some(sp => sp.supplier_id === s.id)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Credit Limit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KES {suppliers.reduce((sum, s) => sum + (s.credit_limit || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-sm text-gray-600 mt-1">
              {suppliers.length} suppliers loaded
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                fetchSuppliers();
                fetchSupplierProducts();
                fetchProducts();
              }}
              disabled={authLoading || loading}
            >
              Refresh
            </Button>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Supplier Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select
                      value={formData.payment_terms}
                      onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate Payment</SelectItem>
                        <SelectItem value="7_days">Net 7 Days</SelectItem>
                        <SelectItem value="15_days">Net 15 Days</SelectItem>
                        <SelectItem value="30_days">Net 30 Days</SelectItem>
                        <SelectItem value="60_days">Net 60 Days</SelectItem>
                        <SelectItem value="90_days">Net 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credit_limit">Credit Limit (KES)</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      step="0.01"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active Supplier</Label>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about this supplier..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    {editingSupplier ? 'Update' : 'Create'} Supplier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Supplier View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Supplier Details</DialogTitle>
            </DialogHeader>
            {viewingSupplier && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Supplier Name</p>
                        <p className="font-medium">{viewingSupplier.name}</p>
                      </div>
                      {viewingSupplier.company_name && (
                        <div>
                          <p className="text-sm text-gray-600">Company Name</p>
                          <p className="font-medium">{viewingSupplier.company_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="font-medium">{viewingSupplier.contact_person || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={viewingSupplier.is_active ? 'default' : 'secondary'}>
                          {viewingSupplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{viewingSupplier.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{viewingSupplier.phone}</p>
                        </div>
                      </div>
                      {viewingSupplier.website && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Website</p>
                            <a href={viewingSupplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {viewingSupplier.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                {(viewingSupplier.address || viewingSupplier.city || viewingSupplier.country) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Address</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm">
                          {[viewingSupplier.address, viewingSupplier.city, viewingSupplier.country]
                            .filter(Boolean)
                            .join(', ') || 'No address provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Business Details</h3>
                    <div className="space-y-3">
                      {supplierProducts.filter(sp => sp.supplier_id === viewingSupplier.id).length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Products Supplied</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplierProducts.filter(sp => sp.supplier_id === viewingSupplier.id).map((sp, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sp.products?.name || 'Unknown Product'} (KES {sp.purchase_price})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingSupplier.payment_terms && (
                        <div>
                          <p className="text-sm text-gray-600">Payment Terms</p>
                          <p className="font-medium">{viewingSupplier.payment_terms}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Financial Information</h3>
                    <div className="space-y-3">
                      {viewingSupplier.credit_limit > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Credit Limit</p>
                          <p className="font-medium text-lg">KES {viewingSupplier.credit_limit.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingSupplier.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Notes</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{viewingSupplier.notes}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Created: {new Date(viewingSupplier.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>Last Updated: {new Date(viewingSupplier.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Supplier Products Management Dialog */}
        <Dialog open={supplierProductsDialogOpen} onOpenChange={setSupplierProductsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Manage Products for {selectedSupplierForProducts?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedSupplierForProducts && (
              <div className="space-y-6">
                {/* Current Products */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Current Products</h3>
                  <div className="space-y-3">
                    {supplierProducts.filter(sp => sp.supplier_id === selectedSupplierForProducts.id).length > 0 ? (
                      supplierProducts.filter(sp => sp.supplier_id === selectedSupplierForProducts.id).map((sp) => (
                        <div key={sp.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{sp.products?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-gray-600">SKU: {sp.products?.sku || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">KES {sp.purchase_price.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Qty: {sp.quantity_supplied}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (confirm('Remove this product from supplier?')) {
                                  try {
                                    const res = await fetch('/api/admin/supplier-products', {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: sp.id }),
                                    });
                                    if (!res.ok) throw new Error(await res.text());
                                    fetchSupplierProducts();
                                    toast({ title: 'Product removed successfully' });
                                  } catch (error: any) {
                                    toast({
                                      title: 'Error',
                                      description: error.message,
                                      variant: 'destructive',
                                    });
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No products assigned to this supplier yet.</p>
                    )}
                  </div>
                </div>

                {/* Add New Product */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Add New Product</h3>
                  <AddProductToSupplierForm
                    supplierId={selectedSupplierForProducts.id}
                    products={products}
                    supplierProducts={supplierProducts}
                    onSuccess={() => {
                      fetchSupplierProducts();
                      toast({ title: 'Product added successfully' });
                    }}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.company_name && (
                            <div className="text-sm text-gray-500">{supplier.company_name}</div>
                          )}
                          {supplier.contact_person && (
                            <div className="text-xs text-gray-500">Contact: {supplier.contact_person}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{supplier.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {[supplier.city, supplier.country].filter(Boolean).join(', ') || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplierProducts.filter(sp => sp.supplier_id === supplier.id).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {supplierProducts.filter(sp => sp.supplier_id === supplier.id).slice(0, 2).map((sp, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sp.products?.name || 'Unknown Product'}
                              </Badge>
                            ))}
                            {supplierProducts.filter(sp => sp.supplier_id === supplier.id).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{supplierProducts.filter(sp => sp.supplier_id === supplier.id).length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No products</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{supplier.payment_terms || 'Not specified'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(supplier)}
                            title="View supplier details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManageProducts(supplier)}
                            title="Manage products"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(supplier)}
                            title="Edit supplier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(supplier.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Building className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="font-medium">No suppliers found</p>
                        <p className="text-sm">Add your first supplier to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}