'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { MathCaptcha } from '@clario/ui';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; answer: number } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captcha) {
      toast.error('Please solve the security question');
      return;
    }

    // Verify captcha before auth
    try {
      const captchaRes = await fetch(`${apiUrl}/api/captcha/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: captcha.captchaId, answer: captcha.answer }),
      });
      const { valid } = await captchaRes.json();
      if (!valid) {
        toast.error('Wrong answer, please try again');
        setCaptcha(null);
        return;
      }
    } catch {
      toast.error('Captcha verification failed');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push('/search');
      router.refresh();
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 text-lg font-extrabold text-foreground hover:opacity-80 transition-opacity"
      >
        clario<span className="text-muted-foreground">.si</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">clario.si</CardTitle>
          <CardDescription>Primerjava cen rezervnih avtodelov</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-pošta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.si"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Geslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <MathCaptcha apiUrl={apiUrl} onChange={setCaptcha} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Prijavljanje…' : 'Prijava'}
            </Button>

            <div className="flex justify-between text-sm text-muted-foreground pt-1">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Pozabljeno geslo?
              </Link>
              <Link href="/register" className="text-primary hover:underline">
                Ustvari račun
              </Link>
            </div>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <Link href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors block">
              Pozabljeno geslo?
            </Link>
            <p className="text-muted-foreground">
              Nimate računa?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Ustvari račun
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
