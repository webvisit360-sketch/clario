'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SiteNavbarProps {
  user?: { companyName?: string };
  onLogout?: () => void;
}

const appLinks = [
  { href: '/search', label: 'Iskanje' },
  { href: '/sellers', label: 'Prodajalci' },
  { href: '/history', label: 'Zgodovina' },
];

const marketingLinks = [
  { href: '#funkcionalnosti', label: 'Funkcionalnosti' },
  { href: '#cenik', label: 'Cenik' },
  { href: '#kako-deluje', label: 'Kako deluje' },
  { href: '#kalkulator', label: 'Kalkulator' },
];

export function SiteNavbar({ user, onLogout }: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === '/';
  const isAuthenticated = Boolean(user);
  const isSearchPage = pathname === '/search';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const navLinks = isAuthenticated ? appLinks : isLanding ? marketingLinks : [];

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    router.push(`/search?q=${encodeURIComponent(navSearch.trim())}`);
    setNavSearch('');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-[52px] flex items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={isAuthenticated ? '/search' : '/'}
            className="text-xl font-extrabold"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            clario<span className="text-muted-foreground">.si</span>
          </Link>
          <span
            className="text-muted-foreground uppercase tracking-wider hidden sm:inline"
            style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px' }}
          >
            B2B Parts
          </span>
        </div>

        {/* Navbar search (authenticated, not on /search page) */}
        {isAuthenticated && !isSearchPage && (
          <form onSubmit={handleNavSearch} className="hidden md:flex items-center ml-6">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Kataloška št..."
                className="w-44 h-8 pl-8 pr-3 text-sm bg-muted/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </form>
        )}

        {/* Center nav links (desktop) */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = !link.href.startsWith('#') && pathname === link.href;
              return link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5 font-medium'
                      : 'text-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {isAuthenticated ? (
            <>
              {user?.companyName && (
                <span className="text-muted-foreground text-sm">{user.companyName}</span>
              )}
              <button
                onClick={onLogout}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm border border-border rounded-lg px-4 py-1.5 hover:bg-muted transition-colors"
              >
                Prijava
              </Link>
              <Link
                href="/register"
                className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-1.5 hover:opacity-90 transition-opacity"
              >
                Brezplačna registracija
              </Link>
            </>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto p-2 text-foreground"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[52px] z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile search (authenticated) */}
            {isAuthenticated && (
              <form onSubmit={(e) => { handleNavSearch(e); setMobileOpen(false); }} className="mb-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    placeholder="Kataloška številka..."
                    className="w-full h-10 pl-10 pr-3 text-sm bg-muted/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </form>
            )}

            {/* Nav links */}
            {navLinks.map((link) => {
              const isActive = !link.href.startsWith('#') && pathname === link.href;
              return link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-foreground hover:text-primary rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${
                    isActive ? 'text-primary bg-primary/5 font-medium' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="border-t border-border my-2" />

            {isAuthenticated ? (
              <>
                {user?.companyName && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{user.companyName}</p>
                )}
                <button
                  onClick={() => { onLogout?.(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-destructive hover:bg-muted rounded-md transition-colors"
                >
                  Odjava
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm border border-border rounded-lg px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  Prijava
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
                >
                  Brezplačna registracija
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
