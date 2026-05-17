'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const blogs = [
  {
    id: 1,
    title: "5 Ways to Enhance Intimacy in Your Relationship",
    description: "Discover proven techniques to deepen your connection and bring more passion into your relationship with these expert tips.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 15, 2024",
    category: "Relationships"
  },
  {
    id: 2,
    title: "Understanding Wellness: A Complete Guide",
    description: "Learn about the importance of personal wellness and how to maintain a healthy, balanced lifestyle with our comprehensive guide.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 12, 2024",
    category: "Wellness"
  },
  {
    id: 3,
    title: "The Science Behind Better Sleep and Intimacy",
    description: "Explore the connection between quality sleep and intimate relationships, backed by scientific research and expert advice.",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 10, 2024",
    category: "Health"
  },
  {
    id: 4,
    title: "Building Trust in Modern Relationships",
    description: "Essential strategies for creating and maintaining trust in your relationship through communication and understanding.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 8, 2024",
    category: "Relationships"
  },
  {
    id: 5,
    title: "Self-Care Practices for Better Intimacy",
    description: "How taking care of yourself can improve your intimate relationships and overall well-being.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 5, 2024",
    category: "Wellness"
  },
  {
    id: 6,
    title: "Communication Tips for Couples",
    description: "Master the art of effective communication to strengthen your relationship and resolve conflicts peacefully.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "March 1, 2024",
    category: "Relationships"
  }
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-black"></div>
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-orange-600/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-red-600/30 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Expert advice, tips, and insights on wellness, relationships, and intimate health
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-12 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249, 115, 22, 0.4) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.id}`}
                className="group block"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-br from-gray-900 to-black rounded-2xl z-10"></div>
                  
                  {/* Content */}
                  <div className="relative z-20">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-transparent to-red-600/40"></div>
                      
                      {/* Geometric overlay */}
                      <div className="absolute top-0 right-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 opacity-80" style={{
                          clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                        }}></div>
                      </div>
                      
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-orange-400 text-xs font-bold rounded-md border border-orange-600/30">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                        <p className="text-gray-500 text-xs">{blog.date}</p>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 transition-all">
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {blog.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold group-hover:gap-3 transition-all">
                          <span>Read More</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 flex items-center justify-center group-hover:from-orange-600 group-hover:to-red-600 transition-all">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
