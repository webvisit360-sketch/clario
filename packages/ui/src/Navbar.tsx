'use client';

import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  companyName?: string;
  onLogout: () => void;
}

export function Navbar({ companyName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-[#1a1a2e] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/search" className="text-amber-400 font-bold text-xl tracking-tight">
              clario.si
            </a>
            <div className="hidden md:flex items-center gap-4">
              <a href="/search" className="text-gray-300 hover:text-white text-sm transition-colors">
                Iskanje
              </a>
              <a href="/sellers" className="text-gray-300 hover:text-white text-sm transition-colors">
                Prodajalci
              </a>
              <a href="/history" className="text-gray-300 hover:text-white text-sm transition-colors">
                Zgodovina
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {companyName && (
              <span className="text-gray-400 text-sm hidden sm:block">{companyName}</span>
            )}
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
