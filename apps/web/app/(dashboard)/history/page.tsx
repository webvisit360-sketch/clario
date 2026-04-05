'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
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
      <PageHeader
        title="Zgodovina iskanj"
        badge={!loading && history.length > 0 ? `${history.length} iskanj` : undefined}
      />

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Še nimate iskanj"
          description="Ko boste iskali rezervne dele, se bo zgodovina iskanj prikazala tukaj. Ponovite naročilo z enim klikom."
          action={{ label: 'Začni iskanje', href: '/search' }}
        />
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
