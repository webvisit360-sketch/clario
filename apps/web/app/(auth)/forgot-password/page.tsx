'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      toast.error('Napaka pri pošiljanju e-pošte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">clario.si</CardTitle>
          <CardDescription>
            {sent ? 'E-pošta poslana' : 'Ponastavitev gesla'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Povezava za ponastavitev gesla je bila poslana na{' '}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Preverjite tudi mapo Nezaželena pošta (spam).
              </p>
              <Link href="/login" className="text-primary hover:underline text-sm">
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
                  {loading ? 'Pošiljanje...' : 'Pošlji povezavo'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Nazaj na prijavo
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
