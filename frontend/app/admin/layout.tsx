'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  MessageSquare,
  Wallet,
  GitBranch
} from 'lucide-react';

interface AdminLoginForm {
  identifier: string;
  password: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginForm>();

  const handleLogin = async (data: AdminLoginForm) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      if (response.data.user.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      login(response.data.token, response.data.user);
      toast.success('Admin login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Store Owner Access</p>
          </div>
          
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <input
                {...register('identifier', { required: 'Email is required' })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email Address"
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Email: admin@admin.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
        </div>
        
        <nav className="mt-6">
          <a
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </a>
          
          <a
            href="/admin/products"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <Package className="h-5 w-5 mr-3" />
            Products
          </a>
          
          <a
            href="/admin/orders"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            Orders
          </a>
          
          <a
            href="/admin/categories"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <Package className="h-5 w-5 mr-3" />
            Categories
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <Users className="h-5 w-5 mr-3" />
            Users
          </a>
          
          <a href="/admin/reviews" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600">
            <MessageSquare className="h-5 w-5 mr-3" />
            Reviews
          </a>
          
          <a href="/admin/wallet" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600">
            <Wallet className="h-5 w-5 mr-3" />
            Wallet Transactions
          </a>
          
          <a href="/admin/referrals" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600">
            <GitBranch className="h-5 w-5 mr-3" />
            Referrals
          </a>
          
          <a
            href="/admin/settings"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </a>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user.name}
            </h1>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}