'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import type { Seller, SellerCreateInput } from '@clario/shared';

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm<SellerCreateInput>();

  const fetchSellers = async () => {
    try {
      const { data } = await api.get('/api/sellers');
      setSellers(data);
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const onSubmit = async (data: SellerCreateInput) => {
    try {
      await api.post('/api/sellers', data);
      setShowModal(false);
      reset();
      fetchSellers();
    } catch (err) {
      console.error('Failed to create seller:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/sellers/${id}`);
      fetchSellers();
    } catch (err) {
      console.error('Failed to delete seller:', err);
    }
  };

  const toggleActive = async (seller: Seller) => {
    try {
      await api.put(`/api/sellers/${seller.id}`, { active: !seller.active });
      fetchSellers();
    } catch (err) {
      console.error('Failed to toggle seller:', err);
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm';

  return (
    <div>
      <PageHeader
        title="Prodajalci"
        badge={!loading && sellers.length > 0 ? `${sellers.filter(s => s.active).length} aktivnih` : undefined}
      >
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors shadow-sm"
        >
          Dodaj prodajalca
        </button>
      </PageHeader>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <EmptyState
          icon="🏪"
          title="Dodajte prvega dobavitelja"
          description="Povežite vaše B2B račune pri dobaviteljih avtodelov. Sistem se bo prijavil z vašimi podatki in primerjal cene."
          action={{ label: 'Dodaj prodajalca', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Ime</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">URL</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">E-pošta</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Aktiven</th>
                <th className="px-4 py-3 text-muted-foreground text-sm font-medium">Dejanja</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, i) => (
                <tr key={seller.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-secondary/40'}`}>
                  <td className="px-4 py-3 text-foreground font-medium">{seller.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{seller.url}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{seller.login_email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(seller)}
                      className={`w-3 h-3 rounded-full ${seller.active ? 'bg-green-500' : 'bg-red-400'}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(seller.id)}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors"
                    >
                      Izbriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Dodaj prodajalca</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ime</label>
                <input {...register('name', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL</label>
                <input {...register('url', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">E-pošta za prijavo</label>
                <input type="email" {...register('login_email', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Geslo za prijavo</label>
                <input type="password" {...register('login_password', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Opombe</label>
                <input {...register('notes')} className={inputClass} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); reset(); }}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors font-medium"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
                >
                  Shrani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
