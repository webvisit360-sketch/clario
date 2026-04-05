import type { Metadata } from 'next';
import { Inter, Syne, Outfit } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['700', '800'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'clario.si — Primerjava cen avtodelov',
  description: 'B2B primerjava cen rezervnih avtodelov za Slovenijo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sl">
      <body className={`${inter.className} ${syne.variable} ${outfit.variable}`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
