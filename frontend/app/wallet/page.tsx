'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { WalletData, ReferralData } from '@/types';
import toast from 'react-hot-toast';
import { Copy, Gift, Users, TrendingUp, Wallet, CheckCircle } from 'lucide-react';

// Badge color per transaction type
const typeBadge: Record<string, string> = {
  referral_bonus: 'bg-green-100 text-green-700',
  referral_reward: 'bg-blue-100 text-blue-700',
  cashback: 'bg-purple-100 text-purple-700',
  debit: 'bg-red-100 text-red-700',
};

const typeLabel: Record<string, string> = {
  referral_bonus: '🎁 Referral Bonus',
  referral_reward: '👥 Referral Reward',
  cashback: '💰 Cashback',
  debit: '💸 Debit',
};

export default function WalletPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'referrals'>('transactions');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, isLoading]);

  const fetchData = async () => {
    try {
      const [walletRes, referralRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getReferrals(),
      ]);
      setWalletData(walletRes.data);
      setReferralData(referralRes.data);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
    } catch {
      // Fallback for http / older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, 99999);
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      if (ok) toast.success(successMsg);
      else toast.error('Copy failed — please copy the link manually');
    }
  };

  // Use walletData code first, fall back to user context
  const referralCode = walletData?.referralCode || user?.referralCode || '';
  const referralLink = mounted ? `${window.location.origin}/login?ref=${referralCode}` : '';

  const copyCode = async () => {
    if (!referralCode) return;
    await copyToClipboard(referralCode, 'Referral code copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    if (!referralCode || !mounted) return;
    await copyToClipboard(referralLink, 'Referral link copied!');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-6">My Wallet</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Wallet Balance */}
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-2xl font-bold gradient-text">₹{walletData?.walletBalance || 0}</p>
            </div>
          </div>

          {/* Total Referrals */}
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-blue-600">{referralData?.totalReferrals || 0}</p>
            </div>
          </div>

          {/* Referral Earnings */}
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Referral Earned</p>
              <p className="text-2xl font-bold text-green-600">₹{referralData?.totalEarned || 0}</p>
            </div>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="card mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-pink-500" />
            <h2 className="font-bold text-gray-800">Your Referral Code</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share your link below. Your friend gets <span className="font-bold text-green-600">₹30</span> wallet bonus on signup, and you earn <span className="font-bold text-pink-600">₹10</span> for every friend who joins!
          </p>

          {/* Code display */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div className="flex items-center gap-2 bg-white border-2 border-pink-300 rounded-lg px-4 py-2">
              <span className="text-xl font-bold tracking-widest gradient-text">
                {referralCode || '—'}
              </span>
              <button onClick={copyCode} className="text-pink-500 hover:text-pink-700 transition-colors">
                {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <button
              onClick={copyLink}
              className="gradient-button text-sm py-2 px-4 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Referral Link
            </button>
          </div>
          {referralCode && mounted && (
            <p className="text-xs text-gray-400 break-all">{referralLink}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300'
            }`}
          >
            Transaction History
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300'
            }`}
          >
            My Referrals ({referralData?.totalReferrals || 0})
          </button>
        </div>

        {/* Transaction History */}
        {activeTab === 'transactions' && (
          <div className="card">
            {walletData?.transactions?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet. Start referring friends!</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {walletData?.transactions?.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge[tx.type]}`}>
                          {typeLabel[tx.type]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{tx.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ml-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals List */}
        {activeTab === 'referrals' && (
          <div className="card">
            {referralData?.referredUsers?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No referrals yet. Share your code and earn ₹10 per signup!
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {referralData?.referredUsers?.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="text-green-600 font-bold">+₹10</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
