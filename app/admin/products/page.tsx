'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock_quantity: number;
  images: string[];
  specifications: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  rating: number | null;
  reviews: number | null;
  badge: string | null;
  original_price: number | null;
  discount: number | null;
  sold_count: number | null;
  stock_left: number | null;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    original_price: '',
    discount: '',
    stock_quantity: '',
    stock_left: '',
    sku: '',
    category_id: '',
    rating: '',
    reviews: '',
    badge: '',
    tag: '',
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchData();
      }
    }
  }, [isAdmin, authLoading, router]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications, is_featured, is_active, rating, reviews, badge, original_price, discount, sold_count, stock_left, tag, created_at, updated_at')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').eq('is_active', true),
      ]);

      if (productsRes.error) {
        console.error('Error fetching products:', productsRes.error);
        toast({
          title: 'Error',
          description: `Failed to fetch products: ${productsRes.error.message}`,
          variant: 'destructive',
        });
      } else {
        setProducts(productsRes.data || []);
      }

      if (categoriesRes.error) {
        console.error('Error fetching categories:', categoriesRes.error);
      } else {
        setCategories(categoriesRes.data || []);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const productData = {
        name: formData.name,
        slug,
        description: formData.description,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        stock_left: formData.stock_left ? parseInt(formData.stock_left) : parseInt(formData.stock_quantity),
        sku: formData.sku,
        category_id: formData.category_id || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews: formData.reviews ? parseInt(formData.reviews) : null,
        badge: formData.badge || null,
        tag: formData.tag || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: [],
        specifications: {},
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Product updated successfully' });
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast({ title: 'Product created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      discount: product.discount?.toString() || '',
      stock_quantity: product.stock_quantity.toString(),
      stock_left: product.stock_left?.toString() || product.stock_quantity.toString(),
      sku: product.sku,
      category_id: product.category_id || '',
      rating: product.rating?.toString() || '',
      reviews: product.reviews?.toString() || '',
      badge: product.badge || '',
      tag: product.tag || '',
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Product deleted successfully' });
      fetchData();
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
      description: '',
      price: '',
      compare_at_price: '',
      original_price: '',
      discount: '',
      stock_quantity: '',
      stock_left: '',
      sku: '',
      category_id: '',
      rating: '',
      reviews: '',
      badge: '',
      tag: '',
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
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
          <h1 className="font-serif text-3xl font-bold text-gray-900">Products</h1>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (KES) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="compare_at_price">Compare At Price (KES)</Label>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="original_price">Original Price (KES)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_left">Stock Left</Label>
                    <Input
                      id="stock_left"
                      type="number"
                      value={formData.stock_left}
                      onChange={(e) => setFormData({ ...formData, stock_left: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      disabled={!!editingProduct}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g., Best Seller, New, Sale"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tag">Tag</Label>
                    <Input
                      id="tag"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g., Premium, Professional"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_featured" className="cursor-pointer">Featured</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No products found. Add your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          {product.tag && (
                            <div className="text-xs text-gray-500">{product.tag}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">KES {product.price.toLocaleString()}</div>
                          {product.original_price && product.original_price > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              KES {product.original_price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{product.stock_quantity} total</div>
                          {product.stock_left !== null && (
                            <div className="text-xs text-gray-500">{product.stock_left} left</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.rating ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm">{product.rating}</span>
                            </div>
                            {product.reviews && (
                              <div className="text-xs text-gray-500">({product.reviews} reviews)</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.badge ? (
                          <Badge variant="outline" className="text-xs">
                            {product.badge}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
