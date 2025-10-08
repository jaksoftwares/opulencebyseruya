// app/page.tsx - Updated Home Page Structure

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TopDeals from '@/components/home/TopDeals';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section - Interactive with luxurious image backgrounds */}
        <Hero />
        
        {/* Featured Categories - Enhanced with vibrant gradients and hover effects */}
        <FeaturedCategories />
        
        {/* Featured Products - Premium product showcase with badges and ratings */}
        <FeaturedProducts />
        
        {/* Top Deals - Hot deals section with countdown timer */}
        <TopDeals />
        
        {/* Why Choose Us - Trust building section with animated cards */}
        <WhyChooseUs />
        
        {/* Testimonials - Customer reviews with carousel */}
        <Testimonials />
        
        {/* Newsletter - Email subscription with benefits */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

/*
IMPLEMENTATION NOTES:
===================

1. HERO SECTION (components/home/Hero.tsx)
   - Full-screen hero with rotating background images
   - Smooth auto-playing carousel (5s intervals)
   - Luxurious gradient overlays
   - Animated text with staggered entrance
   - Stats display (products, customers, guarantee)
   - Dot navigation for manual control

2. FEATURED CATEGORIES (components/home/FeaturedCategories.tsx)
   - 8 category cards with unique gradient colors
   - Hover effects with icon rotation and scaling
   - Glowing effects on hover
   - "View All Categories" CTA button

3. FEATURED PRODUCTS (components/home/FeaturedProducts.tsx)
   - Product grid with high-quality images
   - Dynamic badges (New, Bestseller, Trending)
   - Star ratings and review counts
   - Quick action buttons (wishlist, quick view)
   - Hover overlay with "Add to Cart" button
   - Category filter tabs
   - Discount percentage display

4. TOP DEALS (components/home/TopDeals.tsx)
   - Limited time offers section
   - Live countdown timer to midnight
   - Progress bars showing sold quantity
   - Hot deal badges with flame icons
   - Stock warning indicators
   - Vibrant gradient background

5. WHY CHOOSE US (components/home/WhyChooseUs.tsx)
   - 8 feature cards with unique gradients
   - Animated icons and stat badges
   - Trust metrics display
   - Hover effects with bottom accent bars
   - Trust badges at bottom (customers, rating, etc)

6. TESTIMONIALS (components/home/Testimonials.tsx)
   - Auto-rotating carousel (5s intervals)
   - Customer photos with verified badges
   - 5-star ratings display
   - Product purchased information
   - Navigation arrows and dots
   - Dark elegant background with gradient
   - Stats grid (customers, rating, products, guarantee)

7. NEWSLETTER (components/home/Newsletter.tsx)
   - Eye-catching gradient background
   - 15% discount offer for new subscribers
   - Email input with send animation
   - Success state with checkmark animation
   - 4 benefit cards
   - Animated floating background elements
   - Social proof (10,000+ subscribers)

COLOR PALETTE:
- Primary: Amber/Orange (#F59E0B, #F97316)
- Accent: Gold (#D97706)
- Dark: Gray-900 (#111827)
- Success: Green (#10B981)
- Warning: Red (#EF4444)

FEATURES ADDED:
✅ Interactive hero with image carousel
✅ Vibrant color schemes throughout
✅ Smooth animations and transitions
✅ Hot deals section with countdown
✅ Customer testimonials carousel
✅ Enhanced newsletter with benefits
✅ Trust indicators and social proof
✅ Hover effects on all interactive elements
✅ Mobile responsive design
✅ Accessibility considerations

DEPENDENCIES USED:
- lucide-react (icons)
- Tailwind CSS (styling)
- React hooks (useState, useEffect)
- Next.js Link (navigation)

PERFORMANCE OPTIMIZATIONS:
- Images from Unsplash CDN
- Lazy loading considerations
- Optimized animations
- Minimal re-renders
- Efficient state management
*/
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import Hero from '@/components/home/Hero';
// import FeaturedCategories from '@/components/home/FeaturedCategories';
// import FeaturedProducts from '@/components/home/FeaturedProducts';
// import WhyChooseUs from '@/components/home/WhyChooseUs';
// import Newsletter from '@/components/home/Newsletter';

// export default function Home() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />
//       <main className="flex-1">
//         <Hero />
//         <FeaturedCategories />
//         <FeaturedProducts />
//         <WhyChooseUs />
//         <Newsletter />
//       </main>
//       <Footer />
//     </div>
//   );
// }
