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

    if (password.length < 8) {
      toast.error('Geslo mora imeti vsaj 8 znakov');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Gesli se ne ujemata');
      return;
    }

    if (!captcha) {
      toast.error('Prosimo, rešite varnostno vprašanje');
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
        toast.error('Napačen odgovor, poskusite znova');
        setCaptcha(null);
        return;
      }
    } catch {
      toast.error('Napaka pri preverjanju captcha');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Update profile with company name (trigger creates the row, we update it)
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ company_name: companyName })
          .eq('id', data.user.id);
      }

      toast.success('Registracija uspešna! Prijavite se.');
      router.push('/login');
    } catch {
      toast.error('Napaka pri registraciji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
                minLength={8}
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
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <MathCaptcha apiUrl={apiUrl} onChange={setCaptcha} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registracija...' : 'Ustvari račun'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Že imate račun?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Prijava
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
