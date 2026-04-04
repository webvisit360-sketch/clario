'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MathCaptcha } from '@clario/ui';
import { api } from '@/lib/api';
import type { Seller, SellerCreateInput } from '@clario/shared';

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; answer: number } | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SellerCreateInput>();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    if (!captcha) return;

    // Verify captcha
    try {
      const res = await fetch(`${apiUrl}/api/captcha/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: captcha.captchaId, answer: captcha.answer }),
      });
      const result = await res.json();
      if (!result.valid) {
        setCaptcha(null);
        return;
      }
    } catch {
      return;
    }

    try {
      await api.post('/api/sellers', data);
      setShowModal(false);
      reset();
      setCaptcha(null);
      fetchSellers();
    } catch (err) {
      console.error('Failed to create seller:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ali ste prepričani?')) return;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Prodajalci</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded transition-colors"
        >
          Dodaj prodajalca
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          Še nimate dodanih prodajalcev
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 text-sm font-medium">Ime</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">URL</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">E-pošta</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Aktiven</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Dejanja</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-b border-gray-800">
                  <td className="py-3 text-white">{seller.name}</td>
                  <td className="py-3 text-gray-400 text-sm">{seller.url}</td>
                  <td className="py-3 text-gray-400 text-sm">{seller.login_email}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(seller)}
                      className={`w-3 h-3 rounded-full ${seller.active ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(seller.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Dodaj prodajalca</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Ime</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">URL</label>
                <input
                  {...register('url', { required: true })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">E-pošta za prijavo</label>
                <input
                  type="email"
                  {...register('login_email', { required: true })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Geslo za prijavo</label>
                <input
                  type="password"
                  {...register('login_password', { required: true })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Opombe</label>
                <input
                  {...register('notes')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <MathCaptcha apiUrl={apiUrl} onChange={setCaptcha} />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); reset(); }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  disabled={!captcha}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-medium rounded transition-colors"
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
