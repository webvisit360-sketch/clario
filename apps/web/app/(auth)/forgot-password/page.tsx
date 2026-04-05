'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ponastavitev gesla</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sent
              ? 'Preverite vaš e-poštni predal'
              : 'Vnesite e-pošto in poslali vam bomo navodila'}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <p className="text-foreground">
                Povezava za ponastavitev gesla je bila poslana na{' '}
                <span className="font-medium">{email}</span>.
              </p>
              <p className="text-muted-foreground mt-2">
                Preverite tudi mapo Nezaželena pošta (spam).
              </p>
            </div>
            <Link href="/login" className="text-primary hover:underline text-sm block text-center">
              Nazaj na prijavo
            </Link>
          </div>
        ) : (
          <>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Pošiljanje...' : 'Pošlji navodila'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Nazaj na prijavo
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
