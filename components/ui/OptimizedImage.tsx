'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image, { ImageProps, ImageLoader } from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Connection-aware image loading
function getConnectionSpeed(): 'slow' | 'fast' {
  if (typeof window === 'undefined') return 'fast';
  
  // Use Network Information API if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'slow';
    return 'fast';
  }
  
  return 'fast';
}

// Smart image loader for Next.js
const createSmartLoader = (baseLoader: ImageLoader): ImageLoader => {
  return ({ src, width, quality }) => {
    const connectionSpeed = getConnectionSpeed();
    
    // Adjust quality based on connection speed
    let optimizedQuality = quality || 75;
    if (connectionSpeed === 'slow') {
      optimizedQuality = Math.min(quality || 75, 60); // Lower quality on slow connections
    }
    
    // Use WebP format for modern browsers
    const format = 'webp';
    
    return baseLoader({
      src,
      width,
      quality: optimizedQuality,
    });
  };
};

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholderSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  lazy?: boolean;
  priority?: boolean;
  enableProgressive?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  placeholderSrc,
  showSkeleton = true,
  skeletonClassName,
  lazy = true,
  priority = false,
  enableProgressive = true,
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(!lazy || priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image is visible
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, inView]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setCurrentSrc(src);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    console.log('Image failed to load:', currentSrc, 'Falling back to:', fallbackSrc);
    if (!hasError && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    } else {
      console.log('Fallback also failed, showing error state');
      setCurrentSrc(src); // Keep trying with original src
      onError?.();
    }
  };

  // Create the smart loader
  const smartLoader = useMemo(() => createSmartLoader((props: any) => props.src), []);

  // Progressive loading: show placeholder first, then actual image
  useEffect(() => {
    if (!enableProgressive || !inView) return;

    // Small delay for smooth transition
    const timer = setTimeout(() => {
      setCurrentSrc(src);
    }, 100);

    return () => clearTimeout(timer);
  }, [enableProgressive, inView, src]);

  // Don't render if not in view (for lazy loading)
  if (!inView) {
    return (
      <div 
        ref={imgRef} 
        className={cn("relative bg-gray-100", skeletonClassName)}
        style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
      >
        {showSkeleton && (
          <Skeleton className="w-full h-full" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Progressive Image (placeholder) */}
      {enableProgressive && !isLoaded && placeholderSrc && (
        <Image
          src={placeholderSrc}
          alt={alt}
          fill
          {...props}
          className={cn(
            "absolute inset-0 object-cover transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
          loading="eager" // Load placeholder immediately
          unoptimized
        />
      )}

      {/* Main Image */}
      <Image
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loader={smartLoader}
        loading={lazy && !priority ? "lazy" : "eager"}
        priority={priority}
        {...props}
        className={cn(
          "transition-all duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Loading skeleton overlay */}
      {showSkeleton && !isLoaded && !enableProgressive && (
        <div className={cn("absolute inset-0 bg-gray-100 animate-pulse", skeletonClassName)}>
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">Failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for product images with specific optimizations
export function ProductImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'placeholderSrc'> & {
  placeholderSrc?: string;
}) {
  const placeholderSrc = '/opulence.jpg'; // Use existing company logo as placeholder
  const fallbackSrc = '/opulence1.jpg'; // Use alternative company logo as fallback

  // Create a simple loader that doesn't modify Cloudinary URLs
  const simpleLoader = ({ src, width, quality }: any) => {
    // If it's already a Cloudinary URL or external URL, use as-is
    if (src.startsWith('http')) {
      return src;
    }
    // For local images, use Next.js default behavior
    return src;
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      placeholderSrc={placeholderSrc}
      fallbackSrc={fallbackSrc}
      className={cn("rounded-lg overflow-hidden", className)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={75}
      loader={simpleLoader}
      {...props}
    />
  );
}

// Component for category images
export function CategoryImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'placeholderSrc'>) {
  const placeholderSrc = '/opulence.jpg'; // Use existing company logo as placeholder
  const fallbackSrc = '/opulence1.jpg'; // Use alternative company logo as fallback

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      placeholderSrc={placeholderSrc}
      fallbackSrc={fallbackSrc}
      className={cn("rounded-lg overflow-hidden", className)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      quality={70}
      {...props}
    />
  );
}

// Hook for prefetching images
export function useImagePrefetcher() {
  const prefetchImage = (src: string, priority: boolean = false) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    
    if (priority) {
      // High priority prefetch for hero images
      link.setAttribute('fetchpriority', 'high');
    }
    
    document.head.appendChild(link);
  };

  const prefetchImages = (srcs: string[], priorityCount: number = 2) => {
    srcs.forEach((src, index) => {
      setTimeout(() => {
        prefetchImage(src, index < priorityCount);
      }, index * 100); // Stagger prefetch requests
    });
  };

  return { prefetchImage, prefetchImages };
}