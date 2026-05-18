'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LoginForm {
  identifier: string;
  password: string;
}

interface RegisterForm {
  name: string;
  identifier: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

// Separate component so useSearchParams is inside Suspense
function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  // Auto-fill referral code from URL ?ref=CODE and switch to signup tab
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setIsLogin(false);
      registerForm.setValue('referralCode', refCode.toUpperCase());
    }
  }, [searchParams]);

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      login(response.data.token, response.data.user);
      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      if (!registerData.referralCode?.trim()) delete registerData.referralCode;
      const response = await authAPI.register(registerData);
      login(response.data.token, response.data.user);
      if (registerData.referralCode) {
        toast.success('🎉 Registration successful! ₹30 bonus added to your wallet!');
      } else {
        toast.success('Registration successful!');
      }
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>

        <div className="card">
          {/* Tab switcher */}
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-l-lg transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-r-lg transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Mobile Number
                </label>
                <input
                  {...loginForm.register('identifier', { required: 'Email or mobile is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter email or mobile number"
                />
                {loginForm.formState.errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  {...loginForm.register('password', { required: 'Password is required' })}
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  {...registerForm.register('name', { required: 'Name is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Mobile Number
                </label>
                <input
                  {...registerForm.register('identifier', { required: 'Email or mobile number is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter email or mobile number"
                />
                {registerForm.formState.errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  {...registerForm.register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  {...registerForm.register('confirmPassword', { required: 'Please confirm password' })}
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Referral code — optional, get ₹30 bonus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code{' '}
                  <span className="text-gray-400 font-normal">(optional — get ₹30 bonus!)</span>
                </label>
                <input
                  {...registerForm.register('referralCode')}
                  type="text"
                  className="input-field uppercase"
                  placeholder="e.g. USR8291"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      {/* Suspense required because LoginContent uses useSearchParams */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
