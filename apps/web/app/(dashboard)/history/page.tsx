'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { HistoryEntry } from '@clario/shared';
import { BackButton } from '@/components/ui/back-button';

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
    <div className="relative">
      <BackButton />
      <h1 className="text-2xl font-bold text-foreground mb-6">Zgodovina iskanj</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Še nimate iskanj v zgodovini
        </p>
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Številka dela</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Datum</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Rezultati</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, i) => (
                <tr key={entry.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-secondary/40'}`}>
                  <td className="px-4 py-3 text-foreground font-mono font-medium">{entry.part_number}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(entry.searched_at).toLocaleString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{entry.result_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRepeat(entry.part_number)}
                      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
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
