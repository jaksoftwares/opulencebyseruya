import type { Metadata } from 'next';

// Define Robots type (from Next.js metadata)
export interface Robots {
  index?: boolean;
  follow?: boolean;
  nocache?: boolean;
  googleBot?: string | {
    index?: boolean;
    follow?: boolean;
    noimageindex?: boolean;
    'max-video-preview'?: number;
    'max-image-preview'?: 'none' | 'standard' | 'large';
    'max-snippet'?: number;
  };
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
}

// Type for robots configuration overrides
export type RobotsConfig = Partial<Robots>;

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';

// Core pages that should never be noindexed in production
export const corePages = [
  '/',
  '/shop',
  '/categories',
  '/products',
  // Add more as needed
];

// Get default robots settings based on environment and core status
export function getDefaultRobots(isCore: boolean = false): Robots {
  if (!isProduction) {
    // Staging/dev: noindex, nofollow by default
    return {
      index: false,
      follow: false,
    };
  }

  // Production: index, follow by default
  return {
    index: true,
    follow: true,
  };
}

// Validate robots configuration for safety
export function validateRobots(robots: Robots): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for contradictory directives
  if (robots.index === false && robots.nosnippet === true) {
    warnings.push('nosnippet is redundant when index is false');
  }

  if (robots.index === false && robots.noimageindex === true) {
    warnings.push('noimageindex is redundant when index is false');
  }

  // Check for overly restrictive settings
  if (robots.index === false && robots.follow === false && robots.nocache === true) {
    warnings.push('Page is completely blocked from search engines - consider if this is intentional');
  }

  // Check max values
  if (robots.maxSnippet && robots.maxSnippet < -1) {
    warnings.push('maxSnippet should be -1 (unlimited) or a positive number');
  }

  if (robots.maxVideoPreview && robots.maxVideoPreview < -1) {
    warnings.push('maxVideoPreview should be -1 (unlimited) or a positive number');
  }

  // Warn about noarchive on public content
  if (robots.noarchive === true && robots.index !== false) {
    warnings.push('noarchive prevents caching - ensure this is necessary for public content');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

// Generate dynamic robots.txt content
export function generateRobotsTxt(host: string): string {
  const baseUrl = `https://${host}`;

  let content = `User-agent: *\n`;

  if (!isProduction) {
    content += `Disallow: /\n\n`;
    content += `User-agent: *\nAllow: /_next/static\nAllow: /api/health\n\n`;
  } else {
    // Allow all in production, but block sensitive paths
    content += `Disallow: /admin\n`;
    content += `Disallow: /api/admin\n`;
    content += `Disallow: /api/internal\n`;
    content += `Disallow: /_next\n`;
    content += `Disallow: /api\n`; // Allow specific APIs below
    content += `Allow: /api/newsletter\n`;
    content += `Allow: /api/orders\n`; // If public
    content += `Allow: /api/payments\n`; // If public
    content += `\n`;
  }

  // Allow important bots
  content += `User-agent: Googlebot\n`;
  content += `Allow: /\n\n`;

  content += `User-agent: Bingbot\n`;
  content += `Allow: /\n\n`;

  // Sitemap
  content += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  return content;
}