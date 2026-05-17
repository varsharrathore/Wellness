'use client';

import { useEffect, useState } from 'react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Product } from '@/types';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/price';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    section: 'trending',
    stock: '',
    images: [] as File[],
    videos: [] as File[],
    removeImages: false,
    removeVideos: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 50 }),
        categoriesAPI.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.data || categoriesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      price: '',
      discount: '',
      category: '',
      section: 'trending',
      stock: '',
      images: [],
      videos: [],
      removeImages: false,
      removeVideos: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('subtitle', formData.subtitle);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('discount', formData.discount || '0');
      formDataObj.append('category', formData.category);
      formDataObj.append('section', formData.section);
      formDataObj.append('stock', formData.stock);
      
      formData.images.forEach(image => {
        formDataObj.append('images', image);
      });
      
      formData.videos.forEach(video => {
        formDataObj.append('videos', video);
      });
      
      if (formData.removeImages) {
        formDataObj.append('removeImages', 'true');
      }
      
      if (formData.removeVideos) {
        formDataObj.append('removeVideos', 'true');
      }
      
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, formDataObj);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(formDataObj);
        toast.success('Product created successfully');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      subtitle: product.subtitle || '',
      description: product.description,
      price: product.price.toString(),
      discount: product.discount?.toString() || '0',
      category: product.category,
      section: product.section || 'trending',
      stock: product.stock.toString(),
      images: [],
      videos: [],
      removeImages: false,
      removeVideos: false
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
                resetForm();
              }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Subtitle (Optional)"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Discount (%)"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  max="100"
                />
                
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-20"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name.toLowerCase()}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="trending">Trending Products</option>
                  <option value="hot-deals">Hot Deals</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Images</label>
                  {editingProduct && editingProduct.images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      {editingProduct.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${image}`}
                            alt={`Image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Remove this image?')) {
                                const updatedImages = editingProduct.images.filter((_, i) => i !== index);
                                setEditingProduct({...editingProduct, images: updatedImages});
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, images: Array.from(e.target.files || [])})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Videos</label>
                  {editingProduct && editingProduct.videos.length > 0 && (
                    <div className="mb-2 grid grid-cols-1 gap-2">
                      {editingProduct.videos.map((video, index) => (
                        <div key={index} className="relative">
                          <video
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${video}`}
                            className="w-full h-20 object-cover rounded border"
                            controls
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Remove this video?')) {
                                const updatedVideos = editingProduct.videos.filter((_, i) => i !== index);
                                setEditingProduct({...editingProduct, videos: updatedVideos});
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => setFormData({...formData, videos: Array.from(e.target.files || [])})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  resetForm();
                }} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={product.images[0] ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${product.images[0]}` : '/placeholder-product.svg'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover mr-3"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatPrice(product.finalPrice ?? product.price ?? 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}