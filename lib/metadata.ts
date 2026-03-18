import type { Metadata } from 'next';
import { getDefaultRobots, validateRobots, type RobotsConfig } from './robots';
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateSearchActionSchema,
  type OrganizationData,
  type WebsiteData,
  type SearchActionData,
} from './structured-data';

// Type for metadata overrides - partial of Metadata
export type MetadataOverrides = Partial<Metadata> & {
  canonicalPath?: string;
  robotsConfig?: RobotsConfig;
  isCore?: boolean;
  structuredData?: any[];
};

// Global structured data
const organizationData: OrganizationData = {
  name: 'Opulence by Seruya',
  url: 'https://opulencebyseruya.co.ke',
  logo: 'https://opulencebyseruya.co.ke/opulence.jpg',
  contactPoint: {
    telephone: '+254 742 617 839',
    contactType: 'customer service',
  },
};

const websiteData: WebsiteData = {
  url: 'https://opulencebyseruya.co.ke',
  name: 'Opulence by Seruya',
};

const searchActionData: SearchActionData = {
  target: '/search?q={search_term}',
  queryInput: 'required name=search_term',
};

const globalStructuredData = [
  generateOrganizationSchema(organizationData),
  generateWebsiteSchema(websiteData),
  generateSearchActionSchema(searchActionData, websiteData.url),
];

// Utility to generate canonical URL path, stripping tracking parameters
export function generateCanonical(
  pathname: string,
  searchParams?: URLSearchParams,
  allowedParams: string[] = []
): string {
  const trackingParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
  ];

  const params = new URLSearchParams();

  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (allowedParams.includes(key) || !trackingParams.includes(key)) {
        params.append(key, value);
      }
    });
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// Default metadata configuration
export const defaultMetadata = {
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
  metadataBase: new URL('https://opulencebyseruya.co.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Opulence by Seruya - Luxury Living for Every Home',
    description: 'Discover premium kitchenware, home decor, and lifestyle essentials. Shop elegant dinnerware, cookware, travel accessories, and more.',
    url: 'https://opulencebyseruya.co.ke',
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
  structuredData: globalStructuredData,
} as Metadata & { structuredData?: any[] };

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

  // Handle canonical path
  if (overrides.canonicalPath) {
    merged.alternates = { ...merged.alternates, canonical: overrides.canonicalPath };
  }

  // Handle robots configuration
  if (overrides.robotsConfig || overrides.isCore !== undefined) {
    const defaultRobots = getDefaultRobots(overrides.isCore);
    const robots = { ...defaultRobots, ...overrides.robotsConfig };

    // Core page protection: ensure index in production
    if (overrides.isCore && process.env.NODE_ENV === 'production') {
      robots.index = true;
    }

    // Validate robots settings
    const validation = validateRobots(robots);
    if (!validation.valid) {
      console.warn('Robots validation warnings:', validation.warnings);
    }

    merged.robots = robots;
  }

  // Handle structured data
  if (overrides.structuredData) {
    merged.structuredData = [...(merged.structuredData || []), ...overrides.structuredData];
  }

  // For verification, allow full override
  // It will be set from overrides if provided

  return merged;
}