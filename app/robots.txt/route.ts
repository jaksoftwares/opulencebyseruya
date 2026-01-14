import { NextResponse } from 'next/server';
import { generateRobotsTxt } from '@/lib/robots';

export async function GET() {
  // Get the host from headers
  const host = process.env.VERCEL_URL || 'opulencebyseruya.co.ke';

  const robotsTxt = generateRobotsTxt(host);

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}