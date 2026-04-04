'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { HistoryEntry } from '@clario/shared';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/api/history');
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleRepeat = (partNumber: string) => {
    router.push(`/search?q=${encodeURIComponent(partNumber)}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Zgodovina iskanj</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          Še nimate iskanj v zgodovini
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 text-sm font-medium">Številka dela</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Datum</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Rezultati</th>
                <th className="pb-3 text-gray-400 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-800">
                  <td className="py-3 text-white font-mono">{entry.part_number}</td>
                  <td className="py-3 text-gray-400 text-sm">
                    {new Date(entry.searched_at).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3 text-gray-400 text-sm">{entry.result_count}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleRepeat(entry.part_number)}
                      className="text-amber-400 hover:text-amber-300 text-sm"
                    >
                      Ponovi iskanje
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
