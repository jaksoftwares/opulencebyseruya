'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Phone } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
                Shipping & Delivery Information
              </h1>
              <p className="text-lg text-gray-600">
                Learn about our delivery services and shipping policies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                    Delivery Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Same-day Delivery</h4>
                      <p className="text-gray-600">For clients within Nairobi (orders confirmed before 2 PM)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">24-hour Delivery</h4>
                      <p className="text-gray-600">For orders outside Nairobi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Express Delivery</h4>
                      <p className="text-gray-600">Available for urgent orders (additional charges apply)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-blue-600" />
                    Delivery Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Kenya Nationwide</h4>
                      <p className="text-gray-600">Reliable delivery across all counties</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">East Africa Region</h4>
                      <p className="text-gray-600">Extended delivery to neighboring countries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Order Tracking</h4>
                      <p className="text-gray-600">Real-time updates via WhatsApp and SMS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Delivery Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">Delivery Time</th>
                        <th className="text-left py-3 px-4 font-semibold">Charges</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Nairobi (CBD & Westlands)</td>
                        <td className="py-3 px-4">Same day (before 2 PM)</td>
                        <td className="py-3 px-4">KES 300</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Nairobi (Other areas)</td>
                        <td className="py-3 px-4">Same day</td>
                        <td className="py-3 px-4">KES 500</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Outside Nairobi</td>
                        <td className="py-3 px-4">24 hours</td>
                        <td className="py-3 px-4">KES 800 - KES 1,500</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Other Counties</td>
                        <td className="py-3 px-4">2-3 business days</td>
                        <td className="py-3 px-4">KES 1,000 - KES 2,500</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">East Africa Region</td>
                        <td className="py-3 px-4">3-7 business days</td>
                        <td className="py-3 px-4">Contact for quote</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  * Free delivery on orders above KES 5,000 within Nairobi
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Important Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Order Confirmation</h4>
                  <p className="text-blue-800">
                    All orders must be confirmed and payment verified before delivery arrangements are made.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Delivery Attempts</h4>
                  <p className="text-amber-800">
                    We make up to 3 delivery attempts. Additional attempts may incur extra charges.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Proof of Delivery</h4>
                  <p className="text-green-800">
                    All deliveries require signature or photo confirmation for security purposes.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Delivery Delays</h4>
                  <p className="text-red-800">
                    We are not responsible for delays caused by third-party courier services, weather conditions, or unforeseen circumstances.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us for Delivery Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Have questions about your delivery? Our team is here to help!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://wa.me/254742617839"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      WhatsApp Support
                    </a>
                    <a
                      href="mailto:info@opulencebyseruya.co.ke"
                      className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Email Support
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}