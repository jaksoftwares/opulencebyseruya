import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Product Not Found | Opulence by Seruya',
      description: 'The product you are looking for could not be found.',
    };
  }

  const productImage = product.images && product.images.length > 0 ? product.images[0] : '/opulence.jpg';
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://opulencebyseruya.com'}/products/${product.slug}`;

  return {
    title: `${product.name} | Opulence by Seruya`,
    description: product.description?.substring(0, 160) || `Shop ${product.name} at Opulence by Seruya. Price: KES ${product.price.toLocaleString()}.`,
    keywords: [product.name, 'fashion', 'clothing', 'Opulence by Seruya', product.sku],
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160) || `Shop ${product.name} at Opulence by Seruya`,
      url: productUrl,
      siteName: 'Opulence by Seruya',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.substring(0, 160) || `Shop ${product.name} at Opulence by Seruya`,
      images: [productImage],
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'KES',
      'product:availability': product.stock_quantity > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': 'Opulence by Seruya',
    },
  };
}

async function getProductData(slug: string) {
  // First try active products only
  let { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  // Fallback: if not found, try without is_active filter to handle legacy data
  if (!product) {
    const fallback = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    product = fallback.data ?? null;
  }

  if (!product) {
    return { product: null, category: null, relatedProducts: [] };
  }

  let category = null;
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("id", product.category_id)
      .maybeSingle();

    if (categoryData) {
      category = categoryData;
    }
  }

  const { data: relatedProductsData } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(4);

  const relatedProducts = relatedProductsData ?? [];

  return { product, category, relatedProducts };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { product, category, relatedProducts } = await getProductData(params.slug);

  return (
    <ProductDetailClient
      product={product}
      category={category}
      relatedProducts={relatedProducts}
    />
  );
}