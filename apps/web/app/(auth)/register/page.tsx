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
import { BackButton } from '@/components/ui/back-button';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; answer: number } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!captcha) {
      toast.error('Please solve the security question');
      return;
    }

    // Verify captcha
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }

      // Update profile with company name
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ company_name: companyName })
          .eq('id', data.user.id);
      }

      toast.success('Account created — you can now log in');
      router.push('/login');
    } catch {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <BackButton href="/login" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">clario.si</CardTitle>
          <CardDescription>Ustvarite nov račun</CardDescription>
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
              <Label htmlFor="company">Ime podjetja</Label>
              <Input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Vaše podjetje d.o.o."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Geslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Najmanj 8 znakov"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Potrdi geslo</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ponovi geslo"
                required
                autoComplete="new-password"
              />
            </div>

            <MathCaptcha apiUrl={apiUrl} onChange={setCaptcha} />

            <Button type="submit" className="w-full" disabled={loading || !captcha}>
              {loading ? 'Registracija…' : 'Ustvari račun'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Že imate račun?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Prijava
              </Link>
            </p>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
