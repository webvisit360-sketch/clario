'use client';

import React from 'react';
import type { SearchResult } from '@clario/shared';

interface SellerCardProps {
  result: SearchResult & { status: SearchResult['status'] | 'loading' };
}

function StockDot({ qty }: { qty: number | null }) {
  const color =
    qty === null || qty === 0
      ? 'bg-red-500'
      : qty >= 5
        ? 'bg-green-500'
        : 'bg-yellow-500';
  return <span className={`inline-block w-3 h-3 rounded-full ${color}`} />;
}

export function SellerCard({ result }: SellerCardProps) {
  if (result.status === 'loading') {
    return (
      <div className="bg-card rounded-lg p-4 animate-pulse space-y-3 border border-border">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  if (result.status === 'not_found') {
    return (
      <div className="bg-card rounded-lg p-4 border border-border opacity-60">
        <h3 className="font-semibold text-foreground">{result.seller_name}</h3>
        <p className="text-muted-foreground text-sm mt-2">Artikel ni najden</p>
      </div>
    );
  }

  if (result.status === 'error' || result.status === 'timeout') {
    return (
      <div className="bg-card rounded-lg p-4 border border-destructive/30">
        <h3 className="font-semibold text-foreground">{result.seller_name}</h3>
        <p className="text-destructive text-sm mt-2">
          {result.status === 'timeout' ? 'Časovna omejitev' : result.error ?? 'Napaka'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-foreground">{result.seller_name}</h3>
        {result.image_url ? (
          <img
            src={result.image_url}
            alt={result.part_number_found}
            className="w-12 h-12 object-contain rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-primary mt-2">
        {result.price_net !== null ? `${result.price_net.toFixed(2)} ${result.currency}` : '–'}
      </p>

      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <StockDot qty={result.stock_qty} />
        <span>{result.availability}</span>
      </div>

      <p className="text-xs text-muted-foreground mt-1">{result.part_number_found}</p>

      {result.add_to_cart_url && (
        <a
          href={result.add_to_cart_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded transition-colors"
        >
          V košarico
        </a>
      )}
    </div>
  );
}
