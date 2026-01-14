import type { Metadata } from 'next';

// Type for metadata overrides - partial of Metadata
export type MetadataOverrides = Partial<Metadata>;

// Default metadata configuration
export const defaultMetadata: Metadata = {
  title: 'Opulence by Seruya - Luxury Living for Every Home',
  description: 'Discover premium kitchenware, home decor, and lifestyle essentials. Shop elegant dinnerware, cookware, travel accessories, and more.',
  keywords: 'luxury home goods, kitchenware Kenya, home decor, premium cookware, dinnerware sets and travel essentials',
  authors: [{ name: 'Opulence by Seruya' }],
  creator: 'Opulence by Seruya',
  publisher: 'Opulence by Seruya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://opulencebyseruya.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Opulence by Seruya - Luxury Living for Every Home',
    description: 'Discover premium kitchenware, home decor, and lifestyle essentials. Shop elegant dinnerware, cookware, travel accessories, and more.',
    url: 'https://opulencebyseruya.com',
    siteName: 'Opulence by Seruya',
    images: [
      {
        url: '/opulence.jpg',
        width: 1200,
        height: 630,
        alt: 'Opulence by Seruya - Luxury Home Goods',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opulence by Seruya - Luxury Living for Every Home',
    description: 'Discover premium kitchenware, home decor, and lifestyle essentials. Shop elegant dinnerware, cookware, travel accessories, and more.',
    images: ['/opulence.jpg'],
    creator: '@opulencebyseruya',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
};

// Function to generate metadata by merging defaults with overrides
export function generateMetadata(overrides?: MetadataOverrides): Metadata {
  if (!overrides) return defaultMetadata;

  // Merge top-level properties
  const merged = { ...defaultMetadata, ...overrides };

  // Deep merge nested objects
  if (overrides.openGraph) {
    merged.openGraph = { ...defaultMetadata.openGraph, ...overrides.openGraph };
  }

  if (overrides.twitter) {
    merged.twitter = { ...defaultMetadata.twitter, ...overrides.twitter };
  }

  // For robots and verification, allow full override since they are less likely to need partial merge
  // They will be set from overrides if provided

  return merged;
}