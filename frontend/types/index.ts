export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  walletBalance?: number;
  referralCode?: string;
  isFirstOrderCompleted?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  discount: number;
  finalPrice: number;
  category: any;
  section: 'trending' | 'hot-deals' | 'featured' | 'ads';
  sizes: string[];
  variants: string[];
  stock: number;
  images: string[];
  videos: string[];
  status: 'active' | 'inactive';
  reviews: Review[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: User;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  variant?: string;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  trackingUpdates: {
    status: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  user: string;
  type: 'referral_bonus' | 'referral_reward' | 'cashback' | 'debit';
  amount: number;
  description: string;
  relatedUser?: { name: string; email: string };
  relatedOrder?: { totalAmount: number; createdAt: string };
  createdAt: string;
}

export interface WalletData {
  walletBalance: number;
  referralCode: string;
  transactions: WalletTransaction[];
}

export interface ReferralData {
  totalReferrals: number;
  totalEarned: number;
  referredUsers: { name: string; email: string; createdAt: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  variant?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}
