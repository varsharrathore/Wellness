'use client';

import Link from 'next/link';

const blogs = [
  {
    id: 1,
    title: "5 Ways to Enhance Intimacy in Your Relationship",
    description: "Discover proven techniques to deepen your connection and bring more passion into your relationship with these expert tips.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Understanding Wellness: A Complete Guide",
    description: "Learn about the importance of personal wellness and how to maintain a healthy, balanced lifestyle with our comprehensive guide.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "The Science Behind Better Sleep and Intimacy",
    description: "Explore the connection between quality sleep and intimate relationships, backed by scientific research and expert advice.",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

export default function LatestBlogs() {
  return (
    <section className="py-8 md:py-12 mt-8 md:mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <div className="w-1.5 h-6 bg-gray-600 rounded-full"></div>
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Latest Blogs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                    {blog.description}
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold group-hover:gap-3 transition-all">
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 md:mt-8">
          <Link href="/blogs" className="gradient-button">
            VIEW ALL BLOGS
          </Link>
        </div>
      </div>
    </section>
  );
}
