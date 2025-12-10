import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import CookieConsent from '@/components/CookieConsent';
import { Analytics} from '@vercel/analytics/react';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
            <CookieConsent />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
