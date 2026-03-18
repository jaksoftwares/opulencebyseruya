import { NextResponse } from 'next/server';
import { corePages } from '@/lib/robots';

export async function GET() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://opulencebyseruya.co.ke';

  const urls = corePages.map(path => ({
    loc: `${baseUrl}${path}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: path === '/' ? '1.0' : '0.8',
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}