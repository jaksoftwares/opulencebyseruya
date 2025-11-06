'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, Truck, Shield, Phone, Heart, Share2, 
  Star, ChevronLeft, ChevronRight, Check, Package,
  RefreshCw, Clock, MapPin, Minus, Plus, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
  sku: string;
  specifications: any;
  is_featured: boolean;
  category_id: string | null;
}

interface Category {
  name: string;
  slug: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (productData) {
        setProduct(productData);

        if (productData.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', productData.category_id)
            .maybeSingle();

          if (categoryData) setCategory(categoryData);

          // Fetch related products from the same category
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .neq('id', productData.id)
            .eq('is_active', true)
            .limit(4);

          if (relatedData) setRelatedProducts(relatedData);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        sku: product.sku,
      });
    }

    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} added to your cart.`,
    });

    setQuantity(1);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${product.slug}`;
    const message = `Hi, I'm interested in ordering:\n\n*${product.name}*\nPrice: KES ${product.price.toLocaleString()}\nQuantity: ${quantity}\nSKU: ${product.sku}\nProduct Link: ${productUrl}\n\nPlease provide more details about delivery and payment.`;
    const whatsappUrl = `https://wa.me/254742617839?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} on Opulence by Seruya`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Product link copied to clipboard.',
      });
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      description: isWishlisted 
        ? `${product?.name} removed from your wishlist.`
        : `${product?.name} added to your wishlist.`,
    });
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/shop">
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Home className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
              {category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link href={`/categories/${category.slug}`} className="hover:text-amber-600 transition-colors">
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group">
                <div className="aspect-square relative">
                  {product.images[selectedImage] ? (
                    <>
                      <Image
                        src={product.images[selectedImage]}
                        alt={`${product.name} - Image ${selectedImage + 1}`}
                        fill
                        className={`object-cover transition-transform duration-300 ${
                          isImageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                        onClick={() => setIsImageZoomed(!isImageZoomed)}
                        priority
                      />
                      
                      {/* Navigation Arrows */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-6 w-6 text-gray-900" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-6 w-6 text-gray-900" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImage + 1} / {product.images.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <Package className="h-24 w-24" />
                    </div>
                  )}
                </div>

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                      ⭐ Featured
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white shadow-lg">
                      Save {discount}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {hasMultipleImages && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-amber-500 ring-2 ring-amber-200'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & SKU */}
              <div className="flex items-center justify-between">
                {category && (
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(24 reviews)</span>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  {product.stock_quantity > 0 ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <Check className="h-3 w-3 mr-1" />
                      In Stock ({product.stock_quantity} available)
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    KES {product.price.toLocaleString()}
                  </span>
                  {product.compare_at_price && (
                    <div className="flex flex-col">
                      <span className="text-xl text-gray-500 line-through">
                        KES {product.compare_at_price.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600 font-semibold">
                        You save KES {(product.compare_at_price - product.price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="text-base font-semibold text-gray-900">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-12 w-12 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-8 py-3 font-bold text-lg min-w-[80px] text-center bg-gray-50">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="h-12 w-12 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>

                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={handleWhatsAppOrder}
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 border-2"
                    onClick={handleWishlist}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 border-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="bg-white rounded-xl border-2 border-gray-100 p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Free Delivery</h3>
                    <p className="text-sm text-gray-600">On orders above KES 3,000 within Nairobi</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quality Guarantee</h3>
                    <p className="text-sm text-gray-600">30-day return policy for defective items</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fast Processing</h3>
                    <p className="text-sm text-gray-600">Orders processed within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Customer Support</h3>
                    <p className="text-sm text-gray-600">Call/WhatsApp: 0742 617 839</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-8 py-4"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-8 py-4"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-8 py-4"
                >
                  Delivery & Returns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-8">
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                    {product.description}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="p-8">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <dt className="font-semibold text-gray-900 capitalize mb-1">
                            {key.replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-gray-600">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                             Array.isArray(value) ? value.join(', ') : String(value)}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specifications available for this product.</p>
                )}
              </TabsContent>

              <TabsContent value="delivery" className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="h-6 w-6 text-amber-500" />
                      Delivery Information
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>Same-day delivery for clients within Nairobi (orders confirmed before 2 PM)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>24-hour delivery for orders outside Nairobi</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>Free delivery within Nairobi for orders above KES 5,000</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <RefreshCw className="h-6 w-6 text-amber-500" />
                      Returns & Exchanges
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Eligible Items</h4>
                        <ul className="text-green-800 space-y-1 text-sm">
                          <li>• Technical defects or damage caused under our care</li>
                          <li>• Wrong item delivered</li>
                          <li>• Items damaged during shipping</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Not Eligible</h4>
                        <ul className="text-red-800 space-y-1 text-sm">
                          <li>• Change of mind or buyer&spos;s remorse</li>
                          <li>• Wrong size/color selection</li>
                          <li>• Personal preference</li>
                          <li>• Used or altered items</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Process</h4>
                        <p className="text-blue-800 text-sm">
                          Report issues within 48 hours. We may offer replacement, exchange, or store credit depending on stock availability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Products</h2>
                <p className="text-gray-600">You might also like these products from the same category</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    slug={relatedProduct.slug}
                    price={relatedProduct.price}
                    compareAtPrice={relatedProduct.compare_at_price || undefined}
                    image={relatedProduct.images[0] || ''}
                    isInStock={relatedProduct.stock_quantity > 0}
                    isFeatured={relatedProduct.is_featured}
                    sku={relatedProduct.sku}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}