// Structured Data (JSON-LD) generators for SEO

// Interfaces for schema data
export interface ProductData {
  name: string;
  sku?: string;
  brand?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  description?: string;
  image?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    author: string;
    ratingValue: number;
    reviewBody: string;
  }>;
}

export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
}

export interface WebsiteData {
  url: string;
  name: string;
}

export interface BreadcrumbData {
  itemListElement: Array<{
    position: number;
    name: string;
    item: string;
  }>;
}

export interface SearchActionData {
  target: string;
  queryInput: string;
}

export interface OfferData {
  price: number;
  currency: string;
  availability: string;
  url: string;
}

export interface AggregateRatingData {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface FAQData {
  mainEntity: Array<{
    questionName: string;
    acceptedAnswerText: string;
  }>;
}

export interface HowToData {
  name: string;
  description: string;
  step: Array<{
    text: string;
    position: number;
  }>;
}

// Validation and generation functions

function validateRequired<T>(data: T, requiredFields: (keyof T)[], schemaName: string): boolean {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    console.warn(`Missing required fields for ${schemaName} schema:`, missing);
    return false;
  }
  return true;
}

export function generateProductSchema(data: ProductData, canonicalUrl: string): object | null {
  if (!validateRequired(data, ['name'], 'Product')) return null;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    url: canonicalUrl,
  };

  if (data.sku) schema.sku = data.sku;
  if (data.brand) schema.brand = { '@type': 'Brand', name: data.brand };
  if (data.description) schema.description = data.description;
  if (data.image) schema.image = data.image;

  if (data.price && data.currency) {
    schema.offers = {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency,
      availability: `https://schema.org/${data.availability || 'InStock'}`,
      url: canonicalUrl,
    };
  }

  if (data.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.aggregateRating.ratingValue,
      reviewCount: data.aggregateRating.reviewCount,
    };
  }

  if (data.review && data.review.length > 0) {
    schema.review = data.review.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.ratingValue,
      },
      reviewBody: r.reviewBody,
    }));
  }

  return schema;
}

export function generateOrganizationSchema(data: OrganizationData): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
  };

  if (data.logo) schema.logo = data.logo;
  if (data.contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      telephone: data.contactPoint.telephone,
      contactType: data.contactPoint.contactType,
    };
  }

  return schema;
}

export function generateWebsiteSchema(data: WebsiteData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: data.url,
    name: data.name,
  };
}

export function generateBreadcrumbSchema(data: BreadcrumbData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...data,
  };
}

export function generateSearchActionSchema(data: SearchActionData, websiteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchAction',
    target: `${websiteUrl}${data.target}`,
    'query-input': data.queryInput,
  };
}

export function generateOfferSchema(data: OfferData): object | null {
  if (!validateRequired(data, ['price', 'currency', 'availability', 'url'], 'Offer')) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    price: data.price,
    priceCurrency: data.currency,
    availability: `https://schema.org/${data.availability}`,
    url: data.url,
  };
}

export function generateAggregateRatingSchema(data: AggregateRatingData): object | null {
  if (!validateRequired(data, ['ratingValue', 'reviewCount'], 'AggregateRating')) return null;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: data.ratingValue,
    reviewCount: data.reviewCount,
  };

  if (data.bestRating) schema.bestRating = data.bestRating;
  if (data.worstRating) schema.worstRating = data.worstRating;

  return schema;
}

export function generateFAQSchema(data: FAQData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.mainEntity.map(item => ({
      '@type': 'Question',
      name: item.questionName,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.acceptedAnswerText,
      },
    })),
  };
}

export function generateHowToSchema(data: HowToData): object | null {
  if (!validateRequired(data, ['name', 'description', 'step'], 'HowTo')) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    step: data.step.map(s => ({
      '@type': 'HowToStep',
      text: s.text,
      position: s.position,
    })),
  };
}