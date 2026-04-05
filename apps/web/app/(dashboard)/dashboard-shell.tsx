'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@clario/ui';
import { createClient } from '@/lib/supabase/client';

export default function DashboardShell({
  companyName,
  children,
}: {
  companyName?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Navbar companyName={companyName} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
