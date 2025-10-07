import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturedCategories />
        <FeaturedProducts />
        <WhyChooseUs />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
