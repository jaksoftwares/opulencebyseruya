'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Search, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Header() {
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/opulence.jpg"
              alt="Opulence by Seruya"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/admin" className="hidden md:block">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <a href="https://wa.me/254742617839" target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <Button variant="default" className="bg-green-600 hover:bg-green-700">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors">
                    Admin
                  </Link>
                  <a href="https://wa.me/254742617839" target="_blank" rel="noopener noreferrer" className="mt-4">
                    <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp Us
                    </Button>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
