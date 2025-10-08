"use client";
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Tag, User, Share2, Facebook, Twitter, Mail, Link as LinkIcon, ArrowLeft, ArrowRight, Heart } from 'lucide-react';

// Sample blog post data - replace with your actual data source/API
const blogPost = {
  title: 'The Art of Table Setting: Creating Memorable Dining Experiences',
  slug: 'art-of-table-setting',
  excerpt: 'Discover how thoughtful table arrangements can transform everyday meals into occasions of grace and connection.',
  category: 'Home & Lifestyle',
  author: 'Seruya Team',
  date: '2024-03-15',
  readTime: '5 min read',
  image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
  content: `
    <p class="lead">In a world that often rushes through meals, the art of table setting invites us to slow down, to savor, and to create moments of connection. A beautifully set table is more than decoration—it's an expression of care, a gesture of hospitality, and a canvas for creating memories.</p>

    <h2>The Foundation of Elegance</h2>
    <p>Every great table setting begins with intention. Before you place a single plate or fold a napkin, consider the story you want to tell. Is this an intimate dinner for two? A celebration with family? A gathering of friends? Let this vision guide your choices.</p>

    <p>Start with quality basics: crisp linens, versatile dinnerware, and essential glassware. These foundational pieces serve as your canvas, allowing you to layer textures, colors, and personal touches that reflect your unique style.</p>

    <h2>Layering with Purpose</h2>
    <p>The beauty of a well-set table lies in thoughtful layering. Begin with a tablecloth or placemats that set the tone. Add chargers for dimension, then your dinner plates, salad plates, and bowls—each piece serving a purpose while contributing to the overall aesthetic.</p>

    <blockquote>
      "A table set with care speaks a language of its own—one of warmth, welcome, and the promise of good things to come."
    </blockquote>

    <p>Don't overlook the power of linens. Napkins folded with intention, whether simply placed or artfully arranged, add an element of sophistication. Choose fabrics that feel substantial—linen and cotton blends that soften with each wash, carrying their own stories.</p>

    <h2>The Dance of Light and Reflection</h2>
    <p>Lighting transforms a table from functional to magical. Candlelight, in particular, creates an ambiance that electric lighting simply cannot replicate. Choose candles of varying heights, group them in clusters, or create a centerpiece that incorporates both florals and flames.</p>

    <p>Glassware catches and reflects this light, adding sparkle and sophistication. Don't save your beautiful glasses for special occasions—everyday moments deserve beauty too.</p>

    <h2>Personal Touches That Matter</h2>
    <p>The most memorable tables tell a story unique to the host. This might be:</p>
    <ul>
      <li>Handwritten place cards that make guests feel seen and valued</li>
      <li>Seasonal elements from your garden or local market</li>
      <li>Family heirlooms mixed with contemporary pieces</li>
      <li>A carefully chosen centerpiece that sparks conversation</li>
      <li>Small favors or meaningful details at each setting</li>
    </ul>

    <h2>The Grace of Imperfection</h2>
    <p>Remember that perfection is not the goal—presence is. A table set with love, even if it breaks traditional rules, will always feel more welcoming than one that prioritizes rigid adherence to etiquette over authentic hospitality.</p>

    <p>Mix patterns if they bring you joy. Use grandmother's china alongside modern pieces. Let your personality shine through. The most important element of any table setting is the spirit in which it's created.</p>

    <h2>Creating Your Signature Style</h2>
    <p>As you explore the art of table setting, you'll discover your own aesthetic—a signature style that reflects your values and vision. Perhaps you're drawn to minimalist elegance, rustic charm, or maximalist abundance. Honor what resonates with you.</p>

    <p>Keep a collection of elements you love: napkin rings that catch your eye, vintage flatware from antique markets, unique serving pieces that tell stories. These treasures become part of your table-setting vocabulary, ready to be mixed and matched for different occasions.</p>

    <h2>The Invitation to Gather</h2>
    <p>Ultimately, a beautifully set table is an invitation—to gather, to connect, to slow down and savor. It says, "You matter. This moment matters. Let's create something beautiful together."</p>

    <p>In setting your table with care, you're not just arranging objects. You're creating a sanctuary from the rush of daily life, a space where conversation flows, laughter echoes, and memories are made. This is the true art of table setting: not perfection, but presence; not grandeur, but grace.</p>

    <div class="bg-amber-50 border-l-4 border-amber-600 p-6 my-8">
      <h3 class="font-semibold text-lg mb-2">Quick Tips for Everyday Elegance</h3>
      <ul>
        <li>Keep a "go-to" table setting that you can assemble quickly but still feels special</li>
        <li>Invest in versatile pieces that work across seasons and occasions</li>
        <li>Don't wait for guests—set a beautiful table for yourself and your family</li>
        <li>Take photos of settings you love for future inspiration</li>
        <li>Remember that the best table setting is one that invites people to linger</li>
      </ul>
    </div>

    <p>As you practice this art, may your table become a place of grace, gathering, and gratitude—a reflection of the abundant life you're creating, one meal at a time.</p>
  `
};

// Related posts
const relatedPosts = [
  {
    id: 2,
    slug: 'organizing-kitchen-with-purpose',
    title: 'Organizing Your Kitchen with Purpose and Beauty',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&q=80',
    category: 'Kitchen Tips'
  },
  {
    id: 4,
    slug: 'hosting-with-grace',
    title: 'Hosting with Grace: A Guide to Elegant Entertaining',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80',
    category: 'Entertaining'
  },
  {
    id: 5,
    slug: 'seasonal-home-refresh',
    title: 'Seasonal Home Refresh: Small Changes, Big Impact',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    category: 'Home Decor'
  }
];

export default function BlogPostPage() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blogPost.title;

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Back to Blog */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <a href="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Blog</span>
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-gray-900">
          <img
            src={blogPost.image}
            alt={blogPost.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Article Header */}
        <div className="container mx-auto px-4 -mt-32 relative z-10 mb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white">
              <CardContent className="p-8 md:p-12">
                {/* Category Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full">
                    <Tag className="h-4 w-4" />
                    {blogPost.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {blogPost.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{blogPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(blogPost.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{blogPost.readTime}</span>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      isLiked 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 hover:border-gray-400 text-gray-600 transition-all"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="font-medium">Share</span>
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full mt-2 left-0 bg-white border shadow-xl rounded-lg p-2 min-w-[200px] z-50">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                        >
                          <Facebook className="h-5 w-5 text-blue-600" />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                        >
                          <Twitter className="h-5 w-5 text-sky-500" />
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('email')}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                        >
                          <Mail className="h-5 w-5 text-gray-600" />
                          <span>Email</span>
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                        >
                          <LinkIcon className="h-5 w-5 text-gray-600" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl mx-auto">
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-amber-600 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-amber-50 prose-blockquote:py-4 prose-blockquote:my-8
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                prose-li:text-gray-700 prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-lg
                [&_.lead]:text-xl [&_.lead]:text-gray-600 [&_.lead]:leading-relaxed [&_.lead]:mb-8"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />

            {/* Author Bio */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-serif text-2xl font-bold">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{blogPost.author}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The Opulence by Seruya team is passionate about bringing inspiration, practical wisdom, and beautiful living ideas to your home. We believe in creating spaces that reflect grace, intention, and the abundant life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="bg-gradient-to-br from-amber-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">Continue Reading</h2>
                <p className="text-gray-600 text-lg">More stories to inspire your journey</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((post) => (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full bg-white">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-3">
                          <Tag className="h-4 w-4" />
                          {post.category}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <div className="mt-4 flex items-center gap-2 text-amber-600 font-medium text-sm">
                          <span>Read Article</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative z-10">
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                    Never Miss a Story
                  </h3>
                  <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Get our latest articles, home styling inspiration, and exclusive offers delivered straight to your inbox
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Join 5,000+ readers who start their week inspired</p>
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