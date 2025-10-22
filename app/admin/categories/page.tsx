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
import { Plus, Edit, Trash2, FolderOpen, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAdmin, customer, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [viewCategoryDialogOpen, setViewCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryForSubcategories, setSelectedCategoryForSubcategories] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: '',
    is_active: true,
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    description: '',
    display_order: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');

      // First try with RLS
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      console.log('Categories query result:', { data, error, count: data?.length });

      if (error) {
        console.error('Categories query error:', error);

        // If RLS fails, try to check if categories exist at all
        console.log('Trying to check categories without RLS...');
        const { data: allCategories, error: allError } = await supabase
          .from('categories')
          .select('count', { count: 'exact', head: true });

        console.log('All categories count:', { count: allCategories, error: allError });

        throw error;
      }

      if (data) {
        console.log('Categories loaded:', data.length, 'items');
        setCategories(data);
      } else {
        console.log('No categories data returned');
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast({
        title: 'Error Loading Categories',
        description: `Failed to load categories: ${error.message}. This might be due to database permissions.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSubcategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setSubcategories(data || []);
    } catch (error: any) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchCategories();
        fetchSubcategories();
      }
    }
  }, [isAdmin, authLoading, customer, router, fetchCategories, fetchSubcategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let imageUrl = formData.image_url;
      if (imageFile) {
        const { uploadImageToCloudinary } = await import('@/lib/cloudinary');
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      // Build categoryData strictly matching Supabase schema
      const categoryData: any = {
        name: formData.name,
        slug,
        description: formData.description || '',
        image_url: imageUrl || '',
        display_order: formData.display_order ? parseInt(formData.display_order) : 0,
        is_active: !!formData.is_active,
      };
      // created_at, updated_at handled by Supabase defaults
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...categoryData, id: editingCategory.id } : categoryData),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: editingCategory ? 'Category updated successfully' : 'Category created successfully' });

      // Close dialog and reset form
      setDialogOpen(false);
      resetForm();

      // Refresh data after a short delay to ensure database consistency
      setTimeout(() => {
        fetchCategories();
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image_url: category.image_url,
      display_order: category.display_order.toString(),
      is_active: category.is_active,
    });
    setDialogOpen(true);
  };

  const handleManageSubcategories = (category: Category) => {
    setSelectedCategoryForSubcategories(category);
    setSubcategoryDialogOpen(true);
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setViewCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      display_order: subcategory.display_order.toString(),
      is_active: subcategory.is_active,
    });
    setSubcategoryDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect products.')) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Category deleted successfully' });

      // Refresh data after a short delay to ensure database consistency
      setTimeout(() => {
        fetchCategories();
        fetchSubcategories();
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = subcategoryFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const subcategoryData: any = {
        name: subcategoryFormData.name,
        slug,
        description: subcategoryFormData.description || '',
        display_order: subcategoryFormData.display_order ? parseInt(subcategoryFormData.display_order) : 0,
        is_active: !!subcategoryFormData.is_active,
        category_id: selectedCategoryForSubcategories?.id,
      };

      const method = editingSubcategory ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/subcategories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubcategory ? { ...subcategoryData, id: editingSubcategory.id } : subcategoryData),
      });

      if (!res.ok) throw new Error(await res.text());

      toast({
        title: editingSubcategory ? 'Subcategory updated successfully' : 'Subcategory created successfully'
      });

      // Close dialog and reset form
      setSubcategoryDialogOpen(false);
      resetSubcategoryForm();

      // Refresh data after a short delay to ensure database consistency
      setTimeout(() => {
        fetchSubcategories();
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Subcategory deleted successfully' });

      // Refresh data after a short delay to ensure database consistency
      setTimeout(() => {
        fetchSubcategories();
      }, 500);
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
      image_url: '',
      display_order: '',
      is_active: true,
    });
    setEditingCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      name: '',
      description: '',
      display_order: '',
      is_active: true,
    });
    setEditingSubcategory(null);
    setSelectedCategoryForSubcategories(null);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600 mt-1">
              {categories.length} categories loaded
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                fetchCategories();
                fetchSubcategories();
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
                  Add Category
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
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
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="mt-2">
                      <Label htmlFor="image_file">Or Upload Image</Label>
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                      placeholder="0"
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
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    {editingCategory ? 'Update' : 'Create'} Category
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
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>{category.display_order}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewCategory(category)}
                            title="View category details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManageSubcategories(category)}
                            title="Manage subcategories"
                          >
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            title="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <p className="text-lg mb-2">No categories found</p>
                        <p className="text-sm">Click &quote;Add Category&quote; to create your first category</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Subcategories Management Dialog */}
        <Dialog open={subcategoryDialogOpen} onOpenChange={(open) => {
          setSubcategoryDialogOpen(open);
          if (!open) resetSubcategoryForm();
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Manage Subcategories for {selectedCategoryForSubcategories?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedCategoryForSubcategories && (
              <div className="space-y-6">
                {/* Current Subcategories */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Current Subcategories</h3>
                  <div className="space-y-3">
                    {subcategories.filter(sc => sc.category_id === selectedCategoryForSubcategories.id).length > 0 ? (
                      subcategories.filter(sc => sc.category_id === selectedCategoryForSubcategories.id).map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{subcategory.name}</p>
                              <p className="text-sm text-gray-600">Slug: {subcategory.slug}</p>
                              {subcategory.description && (
                                <p className="text-sm text-gray-500">{subcategory.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Order: {subcategory.display_order}</p>
                              <Badge variant={subcategory.is_active ? 'default' : 'secondary'} className="text-xs">
                                {subcategory.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditSubcategory(subcategory)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubcategory(subcategory.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No subcategories found for this category.</p>
                    )}
                  </div>
                </div>

                {/* Add New Subcategory */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                  </h3>
                  <form onSubmit={handleSubmitSubcategory} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subcategory_name">Subcategory Name *</Label>
                        <Input
                          id="subcategory_name"
                          value={subcategoryFormData.name}
                          onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                          placeholder="Enter subcategory name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subcategory_display_order">Display Order</Label>
                        <Input
                          id="subcategory_display_order"
                          type="number"
                          value={subcategoryFormData.display_order}
                          onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, display_order: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subcategory_description">Description</Label>
                      <Textarea
                        id="subcategory_description"
                        value={subcategoryFormData.description}
                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                        placeholder="Describe this subcategory..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subcategory_is_active"
                        checked={subcategoryFormData.is_active}
                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="subcategory_is_active" className="cursor-pointer">Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                        {editingSubcategory ? 'Update' : 'Create'} Subcategory
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Category View Dialog */}
        <Dialog open={viewCategoryDialogOpen} onOpenChange={setViewCategoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Category Details</DialogTitle>
            </DialogHeader>
            {viewingCategory && (
              <div className="space-y-6">
                {/* Category Image */}
                {viewingCategory.image_url && (
                  <div className="flex justify-center">
                    <img
                      src={viewingCategory.image_url}
                      alt={viewingCategory.name}
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Category Name</p>
                        <p className="font-medium">{viewingCategory.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Slug</p>
                        <p className="font-mono">{viewingCategory.slug}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{viewingCategory.description || 'No description'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Display Order</p>
                        <p className="font-medium">{viewingCategory.display_order}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={viewingCategory.is_active ? 'default' : 'secondary'}>
                          {viewingCategory.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Subcategories</h3>
                    <div className="space-y-3">
                      {subcategories.filter(sc => sc.category_id === viewingCategory.id).length > 0 ? (
                        subcategories.filter(sc => sc.category_id === viewingCategory.id).map((subcategory) => (
                          <div key={subcategory.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{subcategory.name}</p>
                                <p className="text-sm text-gray-600">Slug: {subcategory.slug}</p>
                                {subcategory.description && (
                                  <p className="text-sm text-gray-500 mt-1">{subcategory.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant={subcategory.is_active ? 'default' : 'secondary'} className="text-xs">
                                  {subcategory.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">Order: {subcategory.display_order}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No subcategories found for this category.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Created: {new Date(viewingCategory.created_at || '').toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>Last Updated: {new Date(viewingCategory.updated_at || '').toLocaleDateString()}</p>
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