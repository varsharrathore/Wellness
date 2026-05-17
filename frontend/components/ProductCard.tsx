'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { getUploadUrl } from '@/lib/upload';
import { formatPrice } from '@/lib/price';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isHovering && product.images?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 2000);
    } else {
      setCurrentImageIndex(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isHovering, product.images?.length]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart!');
  };

  const currentImage = product.images?.[currentImageIndex];
  const hasDiscount = product.discount > 0 && product.price > product.finalPrice;

  return (
    <div className="group bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out overflow-hidden">
      <Link href={`/products/${product._id}`} className="block">
        <div
          className="aspect-square bg-gray-50 overflow-hidden relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {currentImage ? (
            <img
              src={getUploadUrl(currentImage)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              -{Math.round(product.discount)}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-black/70 px-4 py-2 rounded-lg text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition-colors text-lg">
            {product.name}
          </h3>
        </Link>

        {product.subtitle && (
          <p className="text-gray-500 text-sm mb-3">{product.subtitle}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.averageRating || 4)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">({product.reviews?.length || 0} reviews)</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.finalPrice ?? product.price ?? 0)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
