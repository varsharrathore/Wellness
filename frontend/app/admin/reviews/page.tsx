'use client';

import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import { Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data.products.filter((p: Product) => p.reviews.length > 0));
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await productsAPI.deleteReview(productId, reviewId);
        toast.success('Review deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews Management</h2>

      <div className="space-y-6">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">{product.name}</h3>
            
            <div className="space-y-4">
              {product.reviews.map(review => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-medium">{review.user.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${image}`}
                              alt="Review"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteReview(product._id, review._id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      )}
    </div>
  );
}