import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-pink-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-pink-400/5 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold mb-4 tracking-widest">WELLNESS</h2>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              Your trusted destination for premium wellness & intimate products. 
              Discreet packaging, fast delivery, and 24/7 support.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="https://facebook.com" target="_blank" className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-pink-400 hover:to-purple-400 rounded-full flex items-center justify-center transition-all duration-300 border border-pink-400/20">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-pink-400 hover:to-purple-400 rounded-full flex items-center justify-center transition-all duration-300 border border-pink-400/20">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-pink-400 hover:to-purple-400 rounded-full flex items-center justify-center transition-all duration-300 border border-pink-400/20">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-pink-400 hover:to-purple-400 rounded-full flex items-center justify-center transition-all duration-300 border border-pink-400/20">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 tracking-wider">SHOP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?section=trending" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link href="/products?section=hot-deals" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Product Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 tracking-wider">CONTACT</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-pink-400 mt-1" />
                <div>
                  <p className="text-gray-400">support@wellnessstore.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-pink-400 mt-1" />
                <div>
                  <p className="text-gray-400">24/7 Customer Support</p>
                  <p className="text-sm text-gray-500">+91 1800-XXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-pink-400 mt-1" />
                <div>
                  <p className="text-gray-400">Free Delivery</p>
                  <p className="text-sm text-gray-500">All Over India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pink-400/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-pink-400 fill-current" /> © 2024 Wellness Store. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/faqs" className="text-gray-400 hover:text-white text-sm transition-colors">
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}