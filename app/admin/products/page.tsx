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
import { Plus, Edit, Trash2, Eye, X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  category_id: string | null;
  subcategory_id: string | null;
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

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Supplier {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, customer, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    compare_at_price: string;
    original_price: string;
    discount: string;
    stock_quantity: string;
    stock_left: string;
    sku: string;
    category_id: string;
    subcategory_id: string;
    supplier_id: string;
    rating: string;
    reviews: string;
    badge: string;
    tag: string;
    is_featured: boolean;
    is_active: boolean;
  }>({
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
    subcategory_id: '',
    supplier_id: '',
    rating: '',
    reviews: '',
    badge: '',
    tag: '',
    is_featured: false,
    is_active: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && customer) {
      if (!isAdmin) {
        router.push('/login');
        return;
      } else {
        fetchData();
      }
    }
  }, [isAdmin, authLoading, customer, router]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Only fetch products for refresh, keep other data cached
      if (isRefresh) {
        const productsRes = await supabase
          .from('products')
          .select('id, category_id, subcategory_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications, is_featured, is_active, rating, reviews, badge, original_price, discount, sold_count, stock_left, tag, created_at, updated_at')
          .order('created_at', { ascending: false });

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
      } else {
        // Initial load - fetch all data
        const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('id, category_id, subcategory_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications, is_featured, is_active, rating, reviews, badge, original_price, discount, sold_count, stock_left, tag, created_at, updated_at')
            .order('created_at', { ascending: false }),
          supabase.from('categories').select('id, name').eq('is_active', true),
          supabase.from('subcategories').select('id, name, category_id').eq('is_active', true),
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

        if (subcategoriesRes.error) {
          console.error('Error fetching subcategories:', subcategoriesRes.error);
        } else {
          setSubcategories(subcategoriesRes.data || []);
        }

        // Fetch suppliers using API (consistent with suppliers page)
        try {
          console.log('Fetching suppliers via API...');
          const suppliersRes = await fetch('/api/admin/suppliers', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!suppliersRes.ok) {
            throw new Error(await suppliersRes.text());
          }

          const suppliersData = await suppliersRes.json();
          console.log('Suppliers loaded via API:', suppliersData.length, 'items');
          setSuppliers(suppliersData || []);
        } catch (suppliersError: any) {
          console.error('Failed to load suppliers via API:', suppliersError);

          // Fallback to direct Supabase query
          try {
            console.log('Trying direct Supabase query for suppliers...');
            const { data, error } = await supabase
              .from('suppliers')
              .select('id, name, company_name, email, phone')
              .eq('is_active', true)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Suppliers query error:', error);
              throw error;
            }

            console.log('Suppliers loaded via Supabase:', data?.length || 0, 'items');
            setSuppliers(data || []);
          } catch (supabaseError: any) {
            console.error('Both API and Supabase queries failed for suppliers:', supabaseError);
            setSuppliers([]);
          }
        }
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
      setRefreshing(false);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImagePreview = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (submitting) return; // Prevent double submission

    setUploading(true);
    setSubmitting(true);
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let imageUrls: string[] = [...existingImages];

      // Show uploading message
      toast({
        title: 'Uploading Images',
        description: 'Please wait while we upload your images to the cloud...',
        variant: 'default',
      });

      // Upload images to Cloudinary FIRST
      if (imageFiles.length > 0) {
        const { uploadImageToCloudinary } = await import('@/lib/cloudinary');
        imageUrls = imageUrls.concat(
          await Promise.all(imageFiles.map(file => uploadImageToCloudinary(file)))
        );
      }

      // Calculate discount automatically
      let discount = null;
      const price = parseFloat(formData.price);
      const compareAtPrice = formData.compare_at_price ? parseFloat(formData.compare_at_price) : null;
      if (compareAtPrice && price && compareAtPrice > price) {
        discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
      }

      // Set stock_left to stock_quantity on creation
      const stock_quantity = parseInt(formData.stock_quantity);
      const stock_left = editingProduct ? (formData.stock_left ? parseInt(formData.stock_left) : stock_quantity) : stock_quantity;

      // Build productData strictly matching Supabase schema
      const productData: any = {
        name: formData.name,
        slug,
        price,
        sku: formData.sku,
        stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
        images: Array.isArray(imageUrls) ? imageUrls : [],
        specifications: {},
        is_featured: !!formData.is_featured,
        is_active: !!formData.is_active,
        stock_left: isNaN(stock_left) ? 0 : stock_left,
      };
      // Optional fields (nullable)
      productData.category_id = formData.category_id || null;
      productData.subcategory_id = formData.subcategory_id || null;
      productData.description = formData.description || '';
      productData.compare_at_price = compareAtPrice !== null ? compareAtPrice : null;
      productData.original_price = formData.original_price ? parseFloat(formData.original_price) : null;
      productData.discount = discount !== null ? discount : null;
      productData.rating = formData.rating ? parseFloat(formData.rating) : null;
      productData.reviews = formData.reviews ? parseInt(formData.reviews) : null;
      productData.badge = formData.badge || null;
      productData.tag = formData.tag || null;
      productData.sold_count = null;

      toast({
        title: 'Saving Product',
        description: 'Saving product data to database...',
        variant: 'default',
      });

      // Create supplier_products entry if supplier is selected
      let supplierProductData = null;
      if (formData.supplier_id) {
        supplierProductData = {
          supplier_id: formData.supplier_id,
          product_id: null, // Will be set after product creation
          purchase_price: price,
          quantity_supplied: stock_quantity,
        };
      }

      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct ? { ...productData, id: editingProduct.id } : productData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to add product');
      }

      const createdProduct = await res.json();

      // Create supplier_products entry if supplier was selected
      if (supplierProductData) {
        try {
          await fetch('/api/admin/supplier-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...supplierProductData,
              product_id: createdProduct.id,
            }),
          });
        } catch (supplierError) {
          console.error('Failed to create supplier product relationship:', supplierError);
          // Don't throw here as the product was created successfully
        }
      }

      // Update products list in state instead of reloading
      if (editingProduct) {
        // Update existing product in state
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? createdProduct : p));
        toast({
          title: 'Product updated successfully',
          description: 'Product has been updated successfully.',
          variant: 'default'
        });
      } else {
        // Add new product to state
        setProducts(prev => [createdProduct, ...prev]);
        toast({
          title: 'Product created successfully',
          description: 'Product has been created successfully.',
          variant: 'default'
        });
      }

      // Show success state briefly
      setShowSuccess(true);

      // Reset success state after a brief moment
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);

      // Close dialog and reset form
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setSubmitting(false);
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
      subcategory_id: product.subcategory_id || '',
      supplier_id: '', // Note: This would need to be fetched from supplier_products table
      rating: product.rating?.toString() || '',
      reviews: product.reviews?.toString() || '',
      badge: product.badge || '',
      tag: product.tag || '',
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setCurrentStep(1);
    setDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Remove product from state immediately
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Product deleted successfully' });
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
      subcategory_id: '',
      supplier_id: '',
      rating: '',
      reviews: '',
      badge: '',
      tag: '',
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.price || !formData.stock_quantity || !formData.sku)) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            </div>

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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= step ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          currentStep > step ? 'bg-amber-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Basic Info</span>
                  <span>Pricing & Details</span>
                  <span>Images</span>
                </div>
              </DialogHeader>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-800 font-medium">
                      Product added successfully! The products list has been refreshed.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === 3) {
                  handleSubmit(e);
                }
              }} onKeyDown={(e) => {
                if (e.key === 'Enter' && currentStep !== 3) {
                  e.preventDefault();
                }
              }} className="space-y-6 mt-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-base">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        className="mt-1.5"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-base">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product..."
                        rows={4}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku" className="text-base">SKU *</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g., PROD-001"
                          className="mt-1.5"
                          required
                          disabled={!!editingProduct}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category_id" className="text-base">Category</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => {
                            setFormData({
                              ...formData,
                              category_id: value,
                              subcategory_id: '' // Reset subcategory when category changes
                            });
                          }}
                        >
                          <SelectTrigger className="mt-1.5">
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

                    {/* Subcategory Selection - Only show if category has subcategories */}
                    {formData.category_id && subcategories.filter(sc => sc.category_id === formData.category_id).length > 0 && (
                      <div>
                        <Label htmlFor="subcategory_id" className="text-base">Subcategory</Label>
                        <Select
                          value={formData.subcategory_id}
                          onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select subcategory (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories
                              .filter(sc => sc.category_id === formData.category_id)
                              .map((subcat) => (
                                <SelectItem key={subcat.id} value={subcat.id}>
                                  {subcat.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Choose a subcategory to better organize your product</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="supplier_id" className="text-base">Supplier</Label>
                      <Select
                        value={formData.supplier_id}
                        onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select supplier (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name} {supplier.company_name && `(${supplier.company_name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Selecting a supplier will automatically create a supplier-product relationship</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-base">Price (KES) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="mt-1.5"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="stock_quantity" className="text-base">Stock Quantity *</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          placeholder="0"
                          className="mt-1.5"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Pricing & Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="original_price" className="text-base">Original Price (KES)</Label>
                        <Input
                          id="original_price"
                          type="number"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                          placeholder="0.00"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="compare_at_price" className="text-base">Compare At Price (KES)</Label>
                        <Input
                          id="compare_at_price"
                          type="number"
                          step="0.01"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                          placeholder="0.00"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="discount" className="text-base">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          placeholder="0"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="stock_left" className="text-base">Stock Left</Label>
                        <Input
                          id="stock_left"
                          type="number"
                          value={formData.stock_left}
                          onChange={(e) => setFormData({ ...formData, stock_left: e.target.value })}
                          placeholder="Same as stock quantity"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating" className="text-base">Rating (1-5)</Label>
                        <Input
                          id="rating"
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                          placeholder="4.5"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reviews" className="text-base">Number of Reviews</Label>
                        <Input
                          id="reviews"
                          type="number"
                          min="0"
                          value={formData.reviews}
                          onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                          placeholder="0"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="badge" className="text-base">Badge</Label>
                        <Input
                          id="badge"
                          value={formData.badge}
                          onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                          placeholder="e.g., Best Seller, New, Sale"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tag" className="text-base">Tag</Label>
                        <Input
                          id="tag"
                          value={formData.tag}
                          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                          placeholder="e.g., Premium, Professional"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-3">Product Status</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_featured"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="rounded w-4 h-4"
                          />
                          <Label htmlFor="is_featured" className="cursor-pointer">Featured Product</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded w-4 h-4"
                          />
                          <Label htmlFor="is_active" className="cursor-pointer">Active/Published</Label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Featured products appear prominently on your homepage. Make sure to add high-quality images and complete descriptions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Images */}
                {uploading && (
                  <div className="flex justify-center items-center py-4">
                    <span className="text-amber-600 font-semibold text-lg">Uploading product, please wait...</span>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Product Images</Label>
                      <div className="mt-2">
                        <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload images</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                          </div>
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                          <div className="grid grid-cols-4 gap-3">
                            {existingImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Existing ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">New Images</p>
                          <div className="grid grid-cols-4 gap-3">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImagePreview(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <div>
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="bg-amber-600 hover:bg-amber-700">
                        Next Step
                      </Button>
                    ) : (
                      <Button type="button" disabled={uploading || submitting} onClick={() => handleSubmit(new Event('submit') as any)} className="bg-amber-600 hover:bg-amber-700">
                        {uploading ? 'Creating Product...' : submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create') + ' Product'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Product View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Product Details</DialogTitle>
            </DialogHeader>
            {viewingProduct && (
              <div className="space-y-6">
                {/* Images */}
                {viewingProduct.images && viewingProduct.images.length > 0 && (
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {viewingProduct.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${viewingProduct.name} ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Product Name</p>
                        <p className="font-medium">{viewingProduct.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">SKU</p>
                        <p className="font-mono">{viewingProduct.sku}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{viewingProduct.description || 'No description'}</p>
                      </div>
                      {viewingProduct.tag && (
                        <div>
                          <p className="text-sm text-gray-600">Tag</p>
                          <Badge variant="outline">{viewingProduct.tag}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Pricing & Stock</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="font-medium text-lg">KES {viewingProduct.price.toLocaleString()}</p>
                      </div>
                      {viewingProduct.original_price && (
                        <div>
                          <p className="text-sm text-gray-600">Original Price</p>
                          <p className="font-medium line-through">KES {viewingProduct.original_price.toLocaleString()}</p>
                        </div>
                      )}
                      {viewingProduct.discount && (
                        <div>
                          <p className="text-sm text-gray-600">Discount</p>
                          <Badge className="bg-green-100 text-green-800">{viewingProduct.discount}% OFF</Badge>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Stock Quantity</p>
                        <p className="font-medium">{viewingProduct.stock_quantity} units</p>
                      </div>
                      {viewingProduct.stock_left !== null && (
                        <div>
                          <p className="text-sm text-gray-600">Stock Left</p>
                          <p className="font-medium">{viewingProduct.stock_left} units</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating & Reviews */}
                {(viewingProduct.rating || viewingProduct.reviews) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Customer Feedback</h3>
                    <div className="flex items-center gap-6">
                      {viewingProduct.rating && (
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xl">★</span>
                            <span className="font-medium text-lg">{viewingProduct.rating}</span>
                          </div>
                        </div>
                      )}
                      {viewingProduct.reviews && (
                        <div>
                          <p className="text-sm text-gray-600">Reviews</p>
                          <p className="font-medium">{viewingProduct.reviews} reviews</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status & Badges */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Status & Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={viewingProduct.is_active ? 'default' : 'secondary'}>
                      {viewingProduct.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {viewingProduct.is_featured && (
                      <Badge className="bg-amber-100 text-amber-800">Featured</Badge>
                    )}
                    {viewingProduct.badge && (
                      <Badge variant="outline">{viewingProduct.badge}</Badge>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Created: {new Date(viewingProduct.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>Last Updated: {new Date(viewingProduct.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
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
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm">Add your first product to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="font-medium">{product.name}</div>
                            {product.tag && (
                              <div className="text-xs text-gray-500">{product.tag}</div>
                            )}
                          </div>
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
                            onClick={() => handleView(product)}
                            title="View product"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete product"
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
    // </div>
  );
}
