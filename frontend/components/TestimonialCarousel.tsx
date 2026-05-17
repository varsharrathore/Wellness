'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    title: "Exceptional Quality & Service",
    review: "The products exceeded my expectations. Discreet packaging and fast delivery made the experience seamless. Highly recommend!",
    name: "Sarah M."
  },
  {
    id: 2,
    title: "Life-Changing Products",
    review: "Amazing quality and customer service. The team was helpful and professional. Will definitely order again!",
    name: "Michael R."
  },
  {
    id: 3,
    title: "Premium Experience",
    review: "Best wellness store I've found online. Products are top-notch and shipping was incredibly fast. Five stars!",
    name: "Jessica L."
  },
  {
    id: 4,
    title: "Highly Satisfied Customer",
    review: "Great selection and quality products. The discreet packaging is much appreciated. Customer service is excellent!",
    name: "David K."
  },
  {
    id: 5,
    title: "Outstanding Service",
    review: "Professional, discreet, and high-quality products. The entire shopping experience was smooth and hassle-free.",
    name: "Emily T."
  },
  {
    id: 6,
    title: "Exceeded Expectations",
    review: "Fast shipping, premium quality, and excellent customer support. This is now my go-to wellness store!",
    name: "James P."
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const getCardClass = (index: number) => {
    const visibleStart = currentIndex;
    const visibleCenter = (currentIndex + 1) % testimonials.length;
    const visibleEnd = (currentIndex + 2) % testimonials.length;
    
    if (index === visibleCenter) return 'scale-110 z-10';
    if (index === visibleStart || index === visibleEnd) return 'scale-90 z-0';
    return 'scale-90 z-0';
  };

  return (
    <section className="py-8 md:py-16 relative overflow-hidden" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/20"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            100K+ Customers Love and Trust Us ❤️
          </h2>
          <p className="text-gray-300 text-xs md:text-base">Real stories from our satisfied customers</p>
        </div>

        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`w-full md:w-1/3 flex-shrink-0 px-4 transition-transform duration-700 ${getCardClass(index)}`}
              >
                <div className="bg-white border-2 border-pink-200 rounded-2xl p-4 md:p-6 shadow-2xl transition-all duration-300 h-full">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <h3 className="text-base md:text-lg font-semibold gradient-text mb-3">
                    {testimonial.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                  
                  <p className="gradient-text text-sm font-medium tracking-wide">
                    — {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-yellow-400' : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
