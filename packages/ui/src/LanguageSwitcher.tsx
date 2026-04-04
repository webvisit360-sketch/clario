'use client';

import React, { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: 'sl', label: '🇸🇮 SL' },
  { code: 'hr', label: '🇭🇷 HR' },
  { code: 'de', label: '🇩🇪 DE' },
  { code: 'en', label: '🇬🇧 EN' },
] as const;

const STORAGE_KEY = 'clario_lang';

export function LanguageSwitcher() {
  const [lang, setLang] = useState('sl');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLang(stored);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLang(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <select
      value={lang}
      onChange={handleChange}
      className="bg-transparent text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code} className="bg-gray-800">
          {l.label}
        </option>
      ))}
    </select>
  );
}
