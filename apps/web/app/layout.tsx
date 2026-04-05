import type { Metadata } from 'next';
import { Inter, Syne, DM_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '500', '600', '700', '800'] });
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-dm-mono', weight: ['400', '500'] });

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
      <body className={`${inter.variable} ${syne.variable} ${dmMono.variable} ${inter.className}`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
