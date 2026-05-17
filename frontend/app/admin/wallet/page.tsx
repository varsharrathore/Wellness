'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const typeBadge: Record<string, string> = {
  referral_bonus: 'bg-green-100 text-green-700',
  referral_reward: 'bg-blue-100 text-blue-700',
  cashback: 'bg-purple-100 text-purple-700',
  debit: 'bg-red-100 text-red-700',
};

const typeLabel: Record<string, string> = {
  referral_bonus: 'Referral Bonus',
  referral_reward: 'Referral Reward',
  cashback: 'Cashback',
  debit: 'Debit',
};

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    try {
      const params: any = { page, limit: 20 };
      if (filter) params.type = filter;
      const res = await adminAPI.getWalletTransactions(params);
      setTransactions(res.data.transactions);
      setStats(res.data.stats);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet Transactions</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s._id} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${typeBadge[s._id] || 'bg-gray-100 text-gray-600'}`}>
              {typeLabel[s._id] || s._id}
            </p>
            <p className="text-xl font-bold text-gray-800">₹{s.total}</p>
            <p className="text-xs text-gray-500">{s.count} transactions</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'referral_bonus', 'referral_reward', 'cashback', 'debit'].map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === t
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === '' ? 'All' : typeLabel[t]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No transactions found</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{tx.user?.name}</p>
                    <p className="text-xs text-gray-400">{tx.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge[tx.type]}`}>
                      {typeLabel[tx.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{tx.description}</td>
                  <td className={`px-4 py-3 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-sm">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
