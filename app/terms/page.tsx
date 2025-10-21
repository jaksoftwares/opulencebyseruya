'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Truck, CreditCard, AlertTriangle, Phone } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
                Terms and Conditions
              </h1>
              <p className="text-lg text-gray-600">
                Please read these terms carefully before using our services
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: October 2025
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Opulence by Seruya. By accessing or placing an order through our website,
                  you agree to the following Terms and Conditions. Please read them carefully before using
                  our services. If you do not agree to these terms, please do not use our website or services.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    About Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Opulence by Seruya  is a registered Kenyan business specializing in
                    premium household and lifestyle items. Our website provides an online shopping platform
                    for customers within Kenya and the East African region.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Website Use
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Provide accurate personal and payment information</li>
                    <li>• Use the site only for lawful purposes</li>
                    <li>• Do not reproduce content without written consent</li>
                    <li>• Respect intellectual property rights</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Products and Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Our Commitment</h4>
                    <p className="text-blue-800">
                      We strive to ensure that all product descriptions, images, and prices are accurate.
                      However, occasional errors may occur.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Pricing Information</h4>
                    <ul className="text-amber-800 space-y-1">
                      <li>• Prices are listed in Kenyan Shillings (Ksh)</li>
                      <li>• Prices are subject to change without prior notice</li>
                      <li>• We reserve the right to correct errors</li>
                      <li>• We may limit quantities or cancel orders for suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  Orders and Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Order Confirmation</h4>
                    <p className="text-green-800">
                      Orders are confirmed once payment is successfully received. We currently accept M-Pesa
                      and Bank Transfers. You will receive an order confirmation message once payment is verified.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Payment Methods</h4>
                    <ul className="text-blue-800 space-y-1">
                      <li>• M-Pesa mobile payments</li>
                      <li>• Bank transfers</li>
                      <li>• Pay on delivery (where available)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-blue-600" />
                  Delivery Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Nairobi Delivery</h4>
                      <p className="text-green-800">
                        Same-day delivery for clients within Nairobi (orders confirmed before 2 PM)
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Outside Nairobi</h4>
                      <p className="text-blue-800">
                        24-hour delivery for orders outside Nairobi
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Important Notes</h4>
                    <ul className="text-amber-800 space-y-1">
                      <li>• Delivery charges vary by location</li>
                      <li>• We are not responsible for delays caused by third-party courier services</li>
                      <li>• Free delivery on orders above KES 5,000 within Nairobi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Returns, Exchanges & Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Eligible Items</h4>
                    <p className="text-green-800">
                      Goods once sold are not refundable, unless the item has a technical defect or
                      damage caused under our care before delivery.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Important Conditions</h4>
                    <ul className="text-red-800 space-y-1">
                      <li>• The issue must be reported within 48 hours of receiving the item</li>
                      <li>• The item must be unused, in original packaging, and accompanied by proof of purchase</li>
                      <li>• Upon verification, we may offer a replacement or exchange</li>
                      <li>• We do not accept returns for change of mind, wrong size/color, or personal preference</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  We respect your privacy. When you shop with us, we collect information such as your
                  name, contact details, delivery address, and payment confirmation to process and deliver
                  your order efficiently. We do not share your data with third parties except for delivery or
                  payment processing purposes. By using our website, you consent to our collection and
                  use of your data as outlined in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  All content on this website—including images, text, logos, and graphics—is the property of
                  Opulence by Seruya and is protected by copyright laws. No part of this website may be
                  copied, reproduced, or distributed without prior written consent.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Opulence by Seruya shall not be held liable for indirect or consequential losses arising
                  from use or inability to use our products or website. Our maximum liability is limited to the
                  total amount paid for the item(s) purchased.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms and Conditions from time to time. Continued use of the
                  website after updates constitutes acceptance of the revised terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    For inquiries, returns, or support, contact us via:
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 mb-6">
                    <p><strong>Phone:</strong> +254 742 617 839</p>
                    <p><strong>Email:</strong> info@opulencebyseruya.co.ke</p>
                    <p><strong>Address:</strong> Nairobi, Kenya</p>
                  </div>
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
                      Contact Support
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    © 2025 Opulence by Seruya. All rights reserved.
                  </p>
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