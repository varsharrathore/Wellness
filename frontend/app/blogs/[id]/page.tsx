'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const blogs = [
  {
    id: 1,
    title: "5 Ways to Enhance Intimacy in Your Relationship",
    description: "Discover proven techniques to deepen your connection and bring more passion into your relationship with these expert tips.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Building and maintaining intimacy in a relationship requires effort, communication, and understanding. Here are five proven ways to enhance the connection with your partner.</p>
      
      <h3>1. Prioritize Quality Time Together</h3>
      <p>In today's busy world, it's easy to let quality time slip away. Make a conscious effort to spend uninterrupted time with your partner, whether it's a weekly date night or simply enjoying a meal together without distractions.</p>
      
      <h3>2. Open and Honest Communication</h3>
      <p>Communication is the foundation of any strong relationship. Share your thoughts, feelings, and desires openly with your partner. Create a safe space where both of you can express yourselves without judgment.</p>
      
      <h3>3. Physical Touch and Affection</h3>
      <p>Physical intimacy goes beyond the bedroom. Small gestures like holding hands, hugging, or a gentle touch can significantly strengthen your emotional bond.</p>
      
      <h3>4. Try New Experiences Together</h3>
      <p>Breaking routine and trying new activities together can reignite the spark in your relationship. Whether it's a new hobby, travel destination, or simply cooking a new recipe together, shared experiences create lasting memories.</p>
      
      <h3>5. Show Appreciation and Gratitude</h3>
      <p>Never underestimate the power of expressing gratitude. Regularly acknowledge and appreciate your partner's efforts, both big and small. This creates a positive atmosphere and strengthens your emotional connection.</p>
    `
  },
  {
    id: 2,
    title: "Understanding Wellness: A Complete Guide",
    description: "Learn about the importance of personal wellness and how to maintain a healthy, balanced lifestyle with our comprehensive guide.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Personal wellness encompasses physical, mental, and emotional health. Understanding and nurturing all aspects of wellness is crucial for a fulfilling life.</p>
      
      <h3>Physical Wellness</h3>
      <p>Maintaining physical health through regular exercise, proper nutrition, and adequate sleep forms the foundation of overall wellness. Listen to your body and give it what it needs.</p>
      
      <h3>Mental Wellness</h3>
      <p>Mental health is just as important as physical health. Practice mindfulness, manage stress effectively, and don't hesitate to seek professional help when needed.</p>
      
      <h3>Emotional Wellness</h3>
      <p>Understanding and managing your emotions is key to emotional wellness. Build healthy relationships, express your feelings appropriately, and develop resilience.</p>
      
      <h3>Creating Balance</h3>
      <p>True wellness comes from balancing all aspects of your life. Set boundaries, prioritize self-care, and remember that it's okay to say no sometimes.</p>
    `
  },
  {
    id: 3,
    title: "The Science Behind Better Sleep and Intimacy",
    description: "Explore the connection between quality sleep and intimate relationships, backed by scientific research and expert advice.",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Research shows a strong connection between quality sleep and intimate relationships. Understanding this link can help improve both aspects of your life.</p>
      
      <h3>How Sleep Affects Intimacy</h3>
      <p>Lack of sleep can lead to decreased libido, irritability, and reduced emotional connection. Prioritizing sleep can significantly improve your intimate life.</p>
      
      <h3>The Role of Hormones</h3>
      <p>Sleep regulates hormones that affect mood, energy, and desire. Getting adequate rest helps maintain hormonal balance, which is crucial for a healthy intimate life.</p>
      
      <h3>Creating a Sleep-Friendly Environment</h3>
      <p>Optimize your bedroom for better sleep: keep it cool, dark, and quiet. Establish a consistent sleep schedule and avoid screens before bedtime.</p>
      
      <h3>Together Time Before Sleep</h3>
      <p>Use the time before sleep to connect with your partner. This can strengthen your bond and improve both sleep quality and intimacy.</p>
    `
  }
];

export default function BlogDetailPage() {
  const params = useParams();
  const blog = blogs.find(b => b.id === Number(params.id));

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Not Found</h1>
          <Link href="/" className="text-orange-600 hover:underline">Return to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="mb-8">
          <img 
            src={blog.image} 
            alt={blog.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          {blog.description}
        </p>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      <Footer />
    </div>
  );
}
