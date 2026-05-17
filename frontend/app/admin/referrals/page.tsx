'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReferrals();
  }, [page]);

  const fetchReferrals = async () => {
    try {
      const res = await adminAPI.getReferrals({ page, limit: 20 });
      setReferrals(res.data.referrals);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <span className="bg-pink-100 text-pink-700 text-sm font-semibold px-3 py-1 rounded-full">
          {total} total referrals
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">New User</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Referred By</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Referral Code Used</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : referrals.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No referrals yet</td></tr>
            ) : (
              referrals.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.referredBy?.name}</p>
                    <p className="text-xs text-gray-400">{r.referredBy?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                      {r.referredBy?.referralCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
