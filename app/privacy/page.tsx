'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, Mail, Phone } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                How we collect, use, and protect your personal information
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Our Commitment to Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  At Opulence by Seruya, we respect your privacy and are committed to protecting your personal information.
                  This privacy policy explains how we collect, use, and safeguard your data when you shop with us.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Personal Details</p>
                      <p className="text-sm text-gray-600">Name, email address, phone number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Delivery Information</p>
                      <p className="text-sm text-gray-600">Shipping address and delivery preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Payment Details</p>
                      <p className="text-sm text-gray-600">Payment confirmation and transaction records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Order Processing</p>
                      <p className="text-sm text-gray-600">To process and fulfill your orders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Delivery Coordination</p>
                      <p className="text-sm text-gray-600">To arrange and track your deliveries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-sm text-gray-600">To provide assistance and resolve issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">We DO NOT Share Your Data With:</h4>
                    <ul className="text-green-800 space-y-1">
                      <li>• Marketing companies or advertisers</li>
                      <li>• Social media platforms</li>
                      <li>• Third-party analytics services</li>
                      <li>• Any other external organizations</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">We ONLY Share With:</h4>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Delivery partners (for shipping purposes only)</li>
                      <li>• Payment processors (for transaction processing only)</li>
                      <li>• Legal authorities (when required by law)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Data Security Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Technical Security</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• SSL encryption for all data transmission</li>
                      <li>• Secure payment processing</li>
                      <li>• Regular security updates</li>
                      <li>• Firewall protection</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Operational Security</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Limited staff access to personal data</li>
                      <li>• Regular staff training on data protection</li>
                      <li>• Secure data storage practices</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">You have the right to:</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Access:</strong> Request a copy of your personal data</li>
                      <li><strong>Correction:</strong> Request updates to inaccurate information</li>
                      <li><strong>Deletion:</strong> Request removal of your data (subject to legal requirements)</li>
                      <li><strong>Portability:</strong> Request your data in a portable format</li>
                      <li><strong>Objection:</strong> Object to certain data processing activities</li>
                    </ul>
                  </div>

                  <p className="text-gray-600">
                    To exercise any of these rights, please contact us using the information provided below.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Our website may use cookies and similar technologies to enhance your browsing experience.
                  These technologies help us:
                </p>
                <ul className="text-gray-600 space-y-1 mb-4">
                  <li>• Remember your preferences and settings</li>
                  <li>• Improve website performance and functionality</li>
                  <li>• Analyze website usage patterns</li>
                  <li>• Provide personalized content and recommendations</li>
                </ul>
                <p className="text-gray-600">
                  You can control cookie settings through your browser preferences. However, disabling cookies may affect website functionality.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We retain your personal information for as long as necessary to provide our services,
                  comply with legal obligations, resolve disputes, and enforce our agreements. Order
                  records and transaction data are typically retained for 7 years for tax and accounting purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Your data is primarily stored and processed within Kenya. In cases where international
                  transfers are necessary (such as for payment processing), we ensure appropriate safeguards
                  are in place to protect your information.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Children&apos;s Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our services are not intended for children under 18 years of age. We do not knowingly
                  collect personal information from children. If we become aware that we have collected
                  personal information from a child, we will take steps to delete such information.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We may update this privacy policy from time to time. We will notify you of any material
                  changes by posting the new policy on this page and updating the &apos;Last updated&apos; date.
                  Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us About Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Have questions about your privacy or want to exercise your data rights?
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
                  <div className="mt-4 text-sm text-gray-500">
                    <p><strong>Data Protection Officer</strong></p>
                    <p>Opulence by Seruya</p>
                    <p>Nairobi, Kenya</p>
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