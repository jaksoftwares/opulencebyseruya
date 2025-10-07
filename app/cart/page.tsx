'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const deliveryFee = cartTotal >= 5000 ? 0 : 300;
  const total = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                        <p className="font-bold text-gray-900">
                          KES {item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Order Summary
                  </h2>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>KES {cartTotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `KES ${deliveryFee.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    {cartTotal < 5000 && cartTotal > 0 && (
                      <p className="text-xs text-amber-600">
                        Add KES {(5000 - cartTotal).toLocaleString()} more for free delivery
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>KES {total.toLocaleString()}</span>
                  </div>

                  <Link href="/checkout">
                    <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link href="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
