'use client';

import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HotDealCard from '@/components/HotDealCard';
import TrendingProductCard from '@/components/TrendingProductCard';
import FeaturedProductCard from '@/components/FeaturedProductCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import PromoBanner from '@/components/PromoBanner';
import TrustFeatures from '@/components/TrustFeatures';
import LatestBlogs from '@/components/LatestBlogs';
import Link from 'next/link';

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [hotDeals, setHotDeals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [trending, deals, featured] = await Promise.all([
          productsAPI.getAll({ section: 'trending', limit: 8 }),
          productsAPI.getAll({ section: 'hot-deals', limit: 8 }),
          productsAPI.getAll({ section: 'featured', limit: 8 })
        ]);
        setTrendingProducts(trending.data.products);
        setHotDeals(deals.data.products);
        setFeaturedProducts(featured.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white m-0 p-0 overflow-x-hidden w-full">
      <Navbar />
      
      <main className="m-0 p-0">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] lg:h-screen flex items-center justify-center" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative text-center max-w-4xl mx-auto px-4 text-white">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-light mb-4 md:mb-8 tracking-widest">
              WELLNESS STORE
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-12 font-light tracking-wide">
              PREMIUM WELLNESS & LIFESTYLE
            </p>
            <Link href="/products" className="inline-block bg-white text-black px-8 md:px-12 py-3 md:py-4 text-xs md:text-sm font-medium tracking-widest hover:bg-gray-100 transition-colors">
              SHOP NOW
            </Link>
          </div>
        </section>

        {/* Running Message Bar */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white py-3 md:py-4 overflow-hidden border-y border-pink-600/20">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-xs md:text-sm font-medium tracking-widest mx-4 md:mx-8">
              FREE DELIVERY ALL OVER INDIA • DISCREET PACKAGING • 24/7 CUSTOMER SUPPORT • SECURE PAYMENTS • FREE DELIVERY ALL OVER INDIA • DISCREET PACKAGING • 24/7 CUSTOMER SUPPORT • SECURE PAYMENTS
            </span>
          </div>
        </div>

        {/* Hot Deals Section */}
        <section className="py-4 md:py-8 gradient-bg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-3 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold gradient-text mb-1 md:mb-2 tracking-tight">
                🔥 HOT DEALS 🔥
              </h2>
              <p className="text-xs md:text-sm text-gray-600">Limited time offers you can&apos;t miss!</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {hotDeals.length > 0 ? (
                hotDeals.slice(0, 8).map((product) => (
                  <HotDealCard key={product._id} product={product} />
                ))
              ) : (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 mb-6 overflow-hidden rounded-3xl">
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 group-hover:scale-105 transition-transform duration-700"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-3 md:mt-6">
              <Link href="/products" className="gradient-button">
                VIEW ALL DEALS
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="py-4 md:py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-3 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-1 md:mb-2 tracking-tight">
                ✨ TRENDING NOW ✨
              </h2>
              <p className="text-xs md:text-sm text-gray-600">What everyone&apos;s talking about</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {trendingProducts.length > 0 ? (
                trendingProducts.slice(0, 8).map((product) => (
                  <TrendingProductCard key={product._id} product={product} />
                ))
              ) : (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 mb-6 overflow-hidden rounded-2xl">
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 group-hover:scale-105 transition-transform duration-700"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-3 md:mt-6">
              <Link href="/products" className="gradient-button">
                EXPLORE TRENDING
              </Link>
            </div>
          </div>
        </section>

        {/* Featured/Ads Section */}
        <section className="py-4 md:py-8 bg-gradient-to-br from-pink-600 via-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-3 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-200 mb-1 md:mb-2 tracking-tight">
                ⭐ FEATURED ⭐
              </h2>
              <p className="text-xs md:text-sm text-pink-100">Exclusive video showcases</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 8).map((product) => (
                  <FeaturedProductCard key={product._id} product={product} />
                ))
              ) : (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-800 mb-6 overflow-hidden rounded-xl">
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black group-hover:scale-105 transition-transform duration-700"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-3 md:mt-6">
              <Link href="/products" className="bg-gradient-to-r from-pink-300 to-purple-300 text-purple-800 px-6 sm:px-8 md:px-12 py-2.5 md:py-4 text-xs md:text-sm font-bold tracking-widest rounded-full hover:from-pink-200 hover:to-purple-200 transition-all shadow-lg">
                VIEW FEATURED
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Features */}
        <div className="mt-8 md:mt-12">
          <TrustFeatures />
        </div>

        {/* Promo Banner */}
        <PromoBanner />

        {/* Testimonials */}
        <TestimonialCarousel />

        {/* Latest Blogs */}
        <LatestBlogs />

        {/* Newsletter */}
        <section className="py-4 md:py-8 gradient-bg">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light gradient-text mb-4 md:mb-6 tracking-widest">
              STAY UPDATED
            </h2>
            <div className="w-16 md:w-24 h-px bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6 md:mb-8"></div>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 font-light tracking-wide">
              Subscribe to receive exclusive offers and wellness tips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="input-field flex-1 text-sm tracking-widest"
              />
              <button className="gradient-button text-sm font-medium tracking-widest">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
