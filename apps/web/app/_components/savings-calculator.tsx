'use client';

import { useState } from 'react';

export function SavingsCalculator() {
  const [orders, setOrders] = useState(80);
  const [avgValue, setAvgValue] = useState(45);
  const [pct, setPct] = useState(12);

  const annual = orders * avgValue * (pct / 100) * 12;

  return (
    <div className="max-w-lg mx-auto border border-border rounded-xl p-6 bg-card">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label
            className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Naročil mesečno
          </label>
          <input
            type="number"
            value={orders}
            onChange={(e) => setOrders(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label
            className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Povp. vrednost (&euro;)
          </label>
          <input
            type="number"
            value={avgValue}
            onChange={(e) => setAvgValue(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label
            className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Pričak. prihranek %
          </label>
          <input
            type="number"
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border border-primary/30 rounded-lg p-4 bg-primary/5">
        <div>
          <p className="text-sm font-medium text-foreground">Ocenjeni letni prihranek</p>
          <p className="text-xs text-muted-foreground">
            pri {pct}% povprečni razliki cen
          </p>
        </div>
        <p
          className="text-3xl font-bold text-emerald-600"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {annual.toLocaleString('sl-SI')} &euro;
        </p>
      </div>
    </div>
  );
}
