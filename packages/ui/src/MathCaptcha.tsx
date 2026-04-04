'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MathCaptchaProps {
  apiUrl: string;
  onChange: (value: { captchaId: string; answer: number } | null) => void;
}

export function MathCaptcha({ apiUrl, onChange }: MathCaptchaProps) {
  const [question, setQuestion] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    onChange(null);
    try {
      const res = await fetch(`${apiUrl}/api/captcha/generate`, { method: 'POST' });
      const data = await res.json();
      setQuestion(data.question);
      setCaptchaId(data.id);
    } catch {
      setError('Napaka pri nalaganju captcha');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, onChange]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);
    setError('');
    if (val && captchaId) {
      onChange({ captchaId, answer: Number(val) });
    } else {
      onChange(null);
    }
  };

  const handleVerifyFailed = () => {
    setError('Napačen odgovor, poskusite znova');
    fetchCaptcha();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Varnostno vprašanje:
      </label>
      {loading ? (
        <div className="h-10 bg-gray-700 animate-pulse rounded" />
      ) : (
        <p className="text-white font-semibold">{question}</p>
      )}
      <input
        type="number"
        value={answer}
        onChange={handleChange}
        placeholder="Vaš odgovor"
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

// Expose handleVerifyFailed for parent components
MathCaptcha.displayName = 'MathCaptcha';
