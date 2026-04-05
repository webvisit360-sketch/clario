'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SellerCard } from '@clario/ui';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import type { SearchResponse, SearchResult } from '@clario/shared';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (partNumber: string) => {
    if (!partNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const { data } = await api.get<SearchResponse>('/api/search', {
        params: { q: partNumber.trim() },
      });
      setResults(data.results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search from URL param (navbar search → redirect)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  }, [searchParams, runSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Iskanje delov</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Vnesite kataloško številko (npr. 1K0615301AC)"
          className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg transition-colors shadow-sm"
        >
          {loading ? 'Iskanje...' : 'Išči'}
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SellerCard
              key={i}
              result={{
                seller_id: '',
                seller_name: '',
                price_net: null,
                currency: 'EUR',
                stock_qty: null,
                availability: '',
                image_url: null,
                part_number_found: '',
                add_to_cart_url: null,
                status: 'loading',
              }}
            />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <SellerCard key={result.seller_id} result={result} />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Ni rezultatov"
          description="Za to kataloško številko ni bilo najdenih rezultatov. Preverite številko ali dodajte dodatne prodajalce."
          action={{ label: 'Upravljaj prodajalce', href: '/sellers' }}
        />
      )}

      {!loading && !searched && (
        <EmptyState
          icon="🔎"
          title="Iskanje rezervnih delov"
          description="Vnesite OEM ali kataloško številko rezervnega dela in primerjajte cene pri vseh vaših dobaviteljih hkrati."
        />
      )}
    </div>
  );
}
