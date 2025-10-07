import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Users, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-amber-50 to-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Opulence by Seruya
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              Bringing luxury living to every Kenyan home through premium quality products and exceptional service
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="prose max-w-none">
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Opulence by Seruya was born from a simple vision: to make luxury home essentials accessible to every Kenyan household. We believe that every home deserves to be adorned with quality products that combine functionality with elegance.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                What started as a passion for beautiful homeware has grown into a trusted destination for premium kitchenware, home decor, and lifestyle essentials. We carefully curate each product in our collection to ensure it meets our high standards of quality and design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <Card className="border-2 hover:border-amber-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <Award className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                  <p className="text-gray-600 text-sm">
                    Every product is carefully selected and tested to meet our premium standards
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-amber-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Customer First</h3>
                  <p className="text-gray-600 text-sm">
                    Your satisfaction is our priority. We're always here to help and support you
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-amber-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Trusted by Many</h3>
                  <p className="text-gray-600 text-sm">
                    Join thousands of satisfied customers who trust us for their home needs
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-amber-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <Truck className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nationwide Delivery</h3>
                  <p className="text-gray-600 text-sm">
                    We deliver to all corners of Kenya with care and reliability
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose max-w-none">
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Our Promise</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                At Opulence by Seruya, we promise to deliver more than just products. We deliver experiences that transform houses into homes. Our commitment extends beyond the sale – we're here to support you with excellent customer service, reliable delivery, and products that stand the test of time.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Whether you're setting up your first home, upgrading your kitchen, or looking for the perfect gift, we're here to make your shopping experience seamless and enjoyable.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                Experience Luxury Living
              </h3>
              <p className="text-gray-700 mb-6">
                Discover our curated collection of premium home essentials
              </p>
              <a href="/shop" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
