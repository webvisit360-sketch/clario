'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MathCaptcha } from '@clario/ui';
import { supabase } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; answer: number } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captcha) {
      setError('Prosimo, rešite varnostno vprašanje');
      return;
    }

    // Verify captcha first
    try {
      const captchaRes = await fetch(`${apiUrl}/api/captcha/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: captcha.captchaId, answer: captcha.answer }),
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.valid) {
        setError('Napačen odgovor, poskusite znova');
        setCaptcha(null);
        return;
      }
    } catch {
      setError('Napaka pri preverjanju captcha');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/search');
    } catch {
      setError('Napaka pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-2">clario.si</h1>
        <p className="text-gray-400 text-center mb-8">Primerjava cen avtodelov</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              E-pošta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              placeholder="vas@email.si"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Geslo
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <MathCaptcha apiUrl={apiUrl} onChange={setCaptcha} />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold py-2.5 rounded transition-colors"
          >
            {loading ? 'Prijavljanje...' : 'Prijava'}
          </button>
        </form>
      </div>
    </div>
  );
}
