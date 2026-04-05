'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-5 left-5 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
      aria-label="Nazaj"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      <span className="text-sm font-medium hidden sm:inline">Nazaj</span>
    </button>
  );
}
