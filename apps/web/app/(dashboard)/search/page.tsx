'use client';

import React, { useState } from 'react';
import { SellerCard } from '@clario/ui';
import { api } from '@/lib/api';
import type { SearchResponse, SearchResult } from '@clario/shared';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const { data } = await api.get<SearchResponse>('/api/search', {
        params: { q: query.trim() },
      });
      setResults(data.results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Iskanje delov</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Vnesite številko dela (npr. 1K0615301AC)"
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold rounded-lg transition-colors"
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
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Ni rezultatov za iskanje</p>
          <p className="text-gray-500 text-sm mt-2">
            Preverite številko dela ali dodajte prodajalce
          </p>
        </div>
      )}
    </div>
  );
}
