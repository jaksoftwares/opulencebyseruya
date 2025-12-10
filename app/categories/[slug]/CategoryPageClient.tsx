"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
  sku: string;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface CategoryPageClientProps {
  category: Category | null;
  subcategories: Subcategory[];
  products: Product[];
}

export default function CategoryPageClient({
  category,
  subcategories,
  products,
}: CategoryPageClientProps) {
  const params = useParams<{ slug: string }>();

  const [categoryState, setCategoryState] = useState<Category | null>(category);
  const [subcategoriesState, setSubcategoriesState] = useState<Subcategory[]>(subcategories);
  const [productsState, setProductsState] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryState || !params?.slug) return;

    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", params.slug as string)
          .maybeSingle();

        if (!categoryData) {
          setCategoryState(null);
          return;
        }

        setCategoryState({
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
        });

        const [{ data: subData }, { data: prodData }] = await Promise.all([
          supabase
            .from("subcategories")
            .select("*")
            .eq("category_id", categoryData.id)
            .eq("is_active", true)
            .order("display_order"),
          supabase
            .from("products")
            .select("*")
            .eq("category_id", categoryData.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
        ]);

        setSubcategoriesState((subData || []) as Subcategory[]);
        setProductsState((prodData || []) as Product[]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryState, params?.slug]);

  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  if (loading && !categoryState) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading category...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!categoryState) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Category not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredProducts = selectedSubcategory
    ? productsState
    : productsState;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{categoryState!.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        <div className="bg-gradient-to-br from-amber-50 to-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {categoryState!.name}
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              {categoryState!.description}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {subcategoriesState.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filter by Subcategory</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedSubcategory
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
                {subcategoriesState.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedSubcategory?.id === subcategory.id
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              {productsState.length} {productsState.length === 1 ? "product" : "products"} found
              {selectedSubcategory && ` in ${selectedSubcategory.name}`}
            </p>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAtPrice={product.compare_at_price || undefined}
                  image={product.images[0] || ""}
                  isInStock={product.stock_quantity > 0}
                  isFeatured={product.is_featured}
                  sku={product.sku}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
