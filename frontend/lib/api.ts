import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        // Only redirect for non-admin pages or if user is not admin
        const isAdminPage = window.location.pathname.startsWith('/admin');
        if (!isAdminPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { identifier: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; identifier: string; password: string; referralCode?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  addReview: (id: string, data: FormData | { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
  deleteReview: (productId: string, reviewId: string) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};

export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getAll: (params?: any) => api.get('/orders', { params }),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data: FormData) => api.post('/categories', data),
  update: (id: string, data: FormData) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const walletAPI = {
  // Get wallet balance + all transactions
  getWallet: () => api.get('/wallet'),
  // Get referral stats (who you referred, total earned)
  getReferrals: () => api.get('/wallet/referrals'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUserStatus: (id: string) => api.put(`/admin/users/${id}/toggle-status`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
  // Wallet & referral admin endpoints
  getWalletTransactions: (params?: any) => api.get('/admin/wallet-transactions', { params }),
  getReferrals: (params?: any) => api.get('/admin/referrals', { params }),
};

export default api;