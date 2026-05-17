'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import AnnouncementBar from './AnnouncementBar';
import { categoriesAPI } from '@/lib/api';
import { getUploadUrl } from '@/lib/upload';

interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <AnnouncementBar />
      
      <nav className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="text-3xl font-bold text-black tracking-wider">
              WELLNESS
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              <Link href="/products" className="relative text-black hover:text-gray-600 transition-colors text-sm font-medium tracking-wide group">
                SHOP
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300 ${
                  pathname === '/products' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              <Link href="/about" className="relative text-black hover:text-gray-600 transition-colors text-sm font-medium tracking-wide group">
                ABOUT
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300 ${
                  pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              <Link href="/faqs" className="relative text-black hover:text-gray-600 transition-colors text-sm font-medium tracking-wide group">
                FAQS
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300 ${
                  pathname === '/faqs' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              <Link href="/track-order" className="relative text-black hover:text-gray-600 transition-colors text-sm font-medium tracking-wide group">
                TRACK ORDER
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300 ${
                  pathname === '/track-order' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="p-2 text-black hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
              {user ? (
                <>
                  <Link href="/orders" className="p-2 text-black hover:text-gray-600" title="My Orders">
                    <User className="h-5 w-5" />
                  </Link>
                  <Link href="/wallet" className="p-2 text-black hover:text-gray-600 relative" title="My Wallet">
                    <Wallet className="h-5 w-5" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-black hover:text-gray-600">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-black hover:text-gray-600 transition-colors text-sm font-medium tracking-wide">
                  LOGIN
                </Link>
              )}
              <Link href="/cart" className="relative p-2 text-black hover:text-gray-600">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-6 space-y-6">
              <Link href="/products" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                SHOP
              </Link>
              <Link href="/about" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                ABOUT
              </Link>
              <Link href="/faqs" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                FAQS
              </Link>
              <Link href="/track-order" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                TRACK ORDER
              </Link>
              {user ? (
                <>
                  <Link href="/orders" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                    MY ORDERS
                  </Link>
                  <Link href="/wallet" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                    MY WALLET
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide">
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link href="/login" className="block text-black hover:text-gray-600 text-lg font-medium tracking-wide" onClick={() => setIsMenuOpen(false)}>
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Categories Bar */}
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-white border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 md:space-x-8 py-4">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category._id} 
                href={`/products?category=${category.name.toLowerCase()}`} 
                className="group text-center"
              >
                <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110 border-2 border-pink-300">
                  {category.icon ? (
                    <img
                      src={getUploadUrl(category.icon)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
