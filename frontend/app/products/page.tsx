'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    section: '',
    rating: ''
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          search: searchParams.get('search') || '',
          category: searchParams.get('category') || filters.category,
          section: searchParams.get('section') || filters.section,
          rating: filters.rating,
          limit: 100
        };
        
        const productsRes = await productsAPI.getAll(params);
        const filteredProducts = productsRes.data.products.filter((p: Product) => p.section !== 'ads');
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-8">Products</h1>
        
        {/* Filters */}
        <div className="mb-6 md:mb-8 flex flex-wrap gap-2 md:gap-4">
          <select 
            className="input-field w-auto text-sm md:text-base px-3 py-2"
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="trending">Trending</option>
            <option value="hot-deals">Hot Deals</option>
          </select>
          
          <select 
            className="input-field w-auto text-sm md:text-base px-3 py-2"
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}