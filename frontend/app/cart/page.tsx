'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getUploadUrl } from '@/lib/upload';
import { formatPrice } from '@/lib/price';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link href="/products" className="gradient-button">
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold gradient-text mb-8">Shopping Cart</h1>
        
        <div className="space-y-4">
          {items.map(item => (
            <div key={`${item.product._id}-${item.size}-${item.variant}`} className="card">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={item.product.images?.[0] ? getUploadUrl(item.product.images[0]) : '/placeholder-product.svg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">{formatPrice(item.product.finalPrice ?? item.product.price ?? 0)}</p>
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  {item.variant && <p className="text-sm text-gray-500">Variant: {item.variant}</p>}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">{formatPrice((item.product.finalPrice ?? item.product.price ?? 0) * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold gradient-text">Total: {formatPrice(getTotalPrice())}</span>
          </div>
          
          {user ? (
            <Link href="/checkout" className="block w-full gradient-button text-center">
              Proceed to Checkout
            </Link>
          ) : (
            <Link href="/login" className="block w-full gradient-button text-center">
              Login to Checkout
            </Link>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}