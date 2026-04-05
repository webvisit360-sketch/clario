'use client';

import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  companyName?: string;
  onLogout: () => void;
}

export function Navbar({ companyName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/search" className="text-primary font-bold text-xl tracking-tight">
              clario.si
            </a>
            <div className="hidden md:flex items-center gap-1">
              <a href="/search" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                Iskanje
              </a>
              <a href="/sellers" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                Prodajalci
              </a>
              <a href="/history" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                Zgodovina
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {companyName && (
              <span className="text-muted-foreground text-sm hidden sm:block font-medium">{companyName}</span>
            )}
            <button
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
