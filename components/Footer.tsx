import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-amber-500 font-bold text-lg mb-4">Opulence by Seruya</h3>
            <p className="text-sm mb-4">
              Luxury living for every home. Discover premium kitchenware, home decor, and lifestyle essentials.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-amber-500 transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-amber-500 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-amber-500 transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-amber-500 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-500 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <a href="tel:+254742617839" className="hover:text-amber-500 transition-colors">
                    +254 742 617 839
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:info@opulencebyseruya.com" className="hover:text-amber-500 transition-colors">
                    info@opulencebyseruya.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>Nairobi, Kenya</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {currentYear} Opulence by Seruya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
