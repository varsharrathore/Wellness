'use client';

import { useState } from 'react';
import { ordersAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await ordersAPI.getById(orderNumber);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { name: 'Order Placed', status: 'pending' },
      { name: 'Processing', status: 'processing' },
      { name: 'Shipped', status: 'shipped' },
      { name: 'Delivered', status: 'delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.status === currentStatus.toLowerCase());
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light text-black mb-6 tracking-widest">
              TRACK ORDER
            </h1>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </div>

          {/* Track Order Form */}
          <div className="bg-gray-50 p-8 mb-12">
            <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2 tracking-wide">
                  ORDER NUMBER
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-sm tracking-wide"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-sm font-medium tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'TRACKING...' : 'TRACK ORDER'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-8 text-center">
              <p className="text-red-600 text-sm tracking-wide">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-8">
              {/* Order Header */}
              <div className="bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-light text-black tracking-wide">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-gray-600 text-sm tracking-wide">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="text-lg font-medium text-black tracking-wide capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white border p-6">
                <h3 className="text-lg font-medium text-black mb-6 tracking-wide">
                  ORDER STATUS
                </h3>
                <div className="flex items-center justify-between">
                  {getStatusSteps(order.status).map((step, index) => (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        step.completed ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <p className={`text-xs text-center tracking-wide ${
                        step.active ? 'text-black font-medium' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      {index < 3 && (
                        <div className={`h-px w-full mt-4 ${
                          step.completed ? 'bg-black' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border p-6">
                <h3 className="text-lg font-medium text-black mb-6 tracking-wide">
                  ORDER ITEMS
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {item.product.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-black tracking-wide">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-600 text-sm tracking-wide">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-black font-medium tracking-wide">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-black tracking-wide">
                      TOTAL
                    </span>
                    <span className="text-lg font-medium text-black tracking-wide">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white border p-6">
                <h3 className="text-lg font-medium text-black mb-4 tracking-wide">
                  SHIPPING ADDRESS
                </h3>
                <div className="text-gray-600 text-sm tracking-wide space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}