'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Search, User, Phone, LogOut, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import GlobalSearch from '@/components/GlobalSearch';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { cartCount } = useCart();
  const { customer, isAdmin, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/blogs', label: 'Blogs' },
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-600 border-b-2 border-amber-600 pb-1'
                      : 'text-gray-700 hover:text-amber-600'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'text-amber-600 border-b-2 border-amber-600 pb-1'
                    : 'text-amber-600 hover:text-amber-700'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <GlobalSearch />

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

            {loading ? (
              <Button variant="ghost" size="icon" className="hidden md:flex" disabled>
                <User className="h-5 w-5 animate-pulse" />
              </Button>
            ) : customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                    <UserCircle className="h-5 w-5" />
                    <span className="text-sm">Hi, {customer.full_name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile#orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      console.log('Sign out clicked');
                      await signOut();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

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
                  {/* Mobile Search */}
                  <div className="pb-4 border-b">
                    <GlobalSearch className="w-full" />
                  </div>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg font-medium transition-colors ${
                          isActive
                            ? 'text-amber-600 bg-amber-50 px-3 py-2 rounded-md'
                            : 'text-gray-700 hover:text-amber-600'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {loading ? (
                    <div className="pt-4 border-t">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ) : customer ? (
                    <>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Hi, {customer.full_name.split(' ')[0]}</p>
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="block text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/profile#orders"
                          onClick={() => setIsOpen(false)}
                          className="block text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
                        >
                          My Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className={`block text-lg font-medium transition-colors ${
                              pathname.startsWith('/admin')
                                ? 'text-amber-600 bg-amber-50 px-3 py-2 rounded-md'
                                : 'text-gray-700 hover:text-amber-600'
                            }`}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Button
                          onClick={async () => {
                            console.log('Mobile sign out clicked');
                            await signOut();
                            setIsOpen(false);
                            router.push('/login');
                          }}
                          variant="outline"
                          className="w-full mt-4"
                        >
                          Sign out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
                    >
                      Sign In
                    </Link>
                  )}

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
