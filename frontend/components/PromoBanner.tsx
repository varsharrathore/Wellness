'use client';

import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Image - Wider */}
          <Link href="/products?category=couple" className="md:col-span-2 relative group overflow-hidden rounded-2xl h-96">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
            <div className="relative h-full flex items-center justify-start px-12">
              <div className="text-left">
                <h3 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  Wondering which<br />massager to get?
                </h3>
                <p className="text-white text-lg mb-6">Explore our premium collection</p>
                <span className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Shop Massagers
                </span>
              </div>
            </div>
          </Link>

          {/* Right Image - Narrower */}
          <Link href="/quiz" className="relative group overflow-hidden rounded-2xl h-96">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/85 to-purple-900/85"></div>
            <div className="relative h-full flex items-center justify-center text-center px-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  Find Your<br />Perfect Match
                </h3>
                <p className="text-white text-sm mb-6">Take our pleasure quiz</p>
                <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors text-sm">
                  Explore Now
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
