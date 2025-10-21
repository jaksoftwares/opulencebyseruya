'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Package, Phone, Mail } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
                Returns, Exchanges & Refunds
              </h1>
              <p className="text-lg text-gray-600">
                Our policy on returns, exchanges, and refunds for your peace of mind
              </p>
            </div>

            <Alert className="mb-8 border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> At Opulence by Seruya, every item is carefully checked before delivery to ensure it meets our quality standards.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                    Eligible for Return/Exchange
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Technical Defects</p>
                      <p className="text-sm text-gray-600">Items with manufacturing defects or damage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Damage</p>
                      <p className="text-sm text-gray-600">Items damaged during shipping under our care</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Wrong Item</p>
                      <p className="text-sm text-gray-600">If we deliver the wrong product</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-6 w-6" />
                    Not Eligible for Return
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Change of Mind</p>
                      <p className="text-sm text-gray-600">Personal preference or buyer&apos;s remorse</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Wrong Size/Color</p>
                      <p className="text-sm text-gray-600">If delivered in good condition</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Used Items</p>
                      <p className="text-sm text-gray-600">Items that have been used or worn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Return Process & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Report the Issue</h4>
                      <p className="text-gray-600">Contact us within 48 hours of receiving the item via WhatsApp or email</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Provide Details</h4>
                      <p className="text-gray-600">Send photos of the defect/damage and include your order number</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Verification</h4>
                      <p className="text-gray-600">Our team will verify the issue and approve the return/exchange</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Resolution</h4>
                      <p className="text-gray-600">Receive replacement, exchange, or refund based on verification</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  Return Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Item Condition</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Must be unused and in original condition</li>
                      <li>• Original packaging and tags must be intact</li>
                      <li>• No signs of wear, damage, or alteration</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Documentation</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Proof of purchase (order number)</li>
                      <li>• Photos showing the defect or damage</li>
                      <li>• Delivery note or receipt</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Issues must be reported within 48 hours</li>
                      <li>• Return shipping arranged within 24 hours of approval</li>
                      <li>• Processing completed within 3-5 business days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Refund & Exchange Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Replacement</h4>
                    <p className="text-sm text-gray-600">Get the same item replaced if available</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Exchange</h4>
                    <p className="text-sm text-gray-600">Exchange for a different item of equal or lesser value</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Store Credit</h4>
                    <p className="text-sm text-gray-600">Receive credit for future purchases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="mb-8 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>No Refunds:</strong> We do not offer cash refunds for change of mind, wrong size/color, or personal preference once the item is delivered in good condition.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us for Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Need to initiate a return or have questions about our policy?
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
                      <Mail className="h-5 w-5 mr-2" />
                      Email Support
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Response time: Within 24 hours during business days
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