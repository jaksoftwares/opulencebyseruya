"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Tag, User, Share2, Facebook, Twitter, Mail, Link as LinkIcon, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { blogPosts } from '@/constants/blogPosts';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  content: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find the current blog post
    const currentPost = blogPosts.find(post => post.slug === slug);
    setBlogPost(currentPost || null);
    setIsLoading(false);

    if (currentPost) {
      // Get related posts from the same category, excluding the current post
      const related = blogPosts
        .filter(post =>
          post.category === currentPost.category &&
          post.slug !== currentPost.slug
        )
        .slice(0, 3);
      
      // If we don't have enough related posts from the same category,
      // fill with other posts
      if (related.length < 3) {
        const additionalPosts = blogPosts
          .filter(post =>
            post.slug !== currentPost.slug &&
            !related.some(relatedPost => relatedPost.slug === post.slug)
          )
          .slice(0, 3 - related.length);
        
        related.push(...additionalPosts);
      }
      
      setRelatedPosts(related);
    }
  }, [slug]);

  // Show loading state while checking for the blog post
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show not found only after loading is complete and no blog post was found
  if (!blogPost) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <a
              href="/blogs"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blogPost.title;

  const handleShare = (platform: 'facebook' | 'twitter' | 'email' | 'copy') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    
    const urls: Record<'facebook' | 'twitter' | 'email', string> = {
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
            <a href="/blogs" className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
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
        {relatedPosts.length > 0 && (
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
                      href={`/blogs/${post.slug}`}
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
        )}

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