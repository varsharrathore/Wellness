'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart } from 'lucide-react';
import { getUploadUrl } from '@/lib/upload';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { formatPrice } from '@/lib/price';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', images: [] as File[] });
  const { addItem } = useCart();
  const isLoggedIn = !!Cookies.get('token');

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = () => {
    productsAPI.getById(params.id as string)
      .then(response => setProduct(response.data))
      .catch(error => console.error('Error:', error));
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success('Added to cart!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please login to add a review');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('rating', reviewData.rating.toString());
      formData.append('comment', reviewData.comment);
      reviewData.images.forEach(image => {
        formData.append('images', image);
      });
      
      await productsAPI.addReview(params.id as string, formData);
      toast.success('Review added successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '', images: [] });
      fetchProduct();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const renderClickableStars = (rating: number, onRate: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 cursor-pointer ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        onClick={() => onRate(i + 1)}
      />
    ));
  };

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <img
                src={product.images?.[selectedImageIndex] ? getUploadUrl(product.images[selectedImageIndex]) : '/placeholder-product.svg'}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={getUploadUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-full aspect-square object-cover rounded cursor-pointer hover:opacity-75 ${
                      selectedImageIndex === index ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.averageRating)}
              </div>
              <span className="ml-2 text-gray-600">({product.reviews.length} reviews)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(product.finalPrice)}</span>
              {product.discount > 0 && (
                <span className="ml-2 text-xl text-gray-500 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Reviews</h3>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-primary"
                  >
                    Add Review
                  </button>
                )}
              </div>
              
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex items-center">
                      {renderClickableStars(reviewData.rating, (rating) => setReviewData({...reviewData, rating}))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Images (optional)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setReviewData({...reviewData, images: Array.from(e.target.files || [])})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="btn-primary">Submit Review</button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  </div>
                </form>
              )}
              
              {product.reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-medium">{review.user.name}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2 mb-2">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={getUploadUrl(image)}
                              alt="Review"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}