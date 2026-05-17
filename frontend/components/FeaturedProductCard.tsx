'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { getUploadUrl } from '@/lib/upload';
import { formatPrice } from '@/lib/price';
import toast from 'react-hot-toast';

export default function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideos = product.videos?.length > 0;
  const hasImages = product.images?.length > 0;

  // Play video when component mounts or video index changes
  useEffect(() => {
    if (hasVideos && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser — that's fine, user can click
      });
    }
  }, [currentVideoIndex, hasVideos]);

  const handleVideoEnded = () => {
    if (product.videos?.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % product.videos.length);
    } else {
      // Loop single video
      videoRef.current?.play();
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product._id}`} className="block">
        <div className="aspect-square bg-gray-900 relative overflow-hidden">
          {/* Show video if available */}
          {hasVideos ? (
            <video
              ref={videoRef}
              src={getUploadUrl(product.videos[currentVideoIndex])}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              loop={product.videos.length === 1}
              onEnded={handleVideoEnded}
            />
          ) : hasImages ? (
            /* Fallback to image if no video */
            <img
              src={getUploadUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Media</span>
            </div>
          )}

          {product.discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              -{product.discount}%
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 bg-gray-50">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.subtitle && (
          <p className="text-gray-500 text-xs mb-2">{product.subtitle}</p>
        )}

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(product.averageRating || 4)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1">({product.reviews?.length || 0})</span>
        </div>

        <div className="mb-2">
          <p className="text-lg font-bold text-gray-900">{formatPrice(product.finalPrice ?? product.price ?? 0)}</p>
          {product.discount > 0 && (
            <p className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-3 rounded-md hover:from-pink-600 hover:to-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
