import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { supabase } from '@/lib/supabase';

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

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}