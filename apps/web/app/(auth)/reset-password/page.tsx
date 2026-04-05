'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event from the URL hash tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Geslo je bilo uspešno posodobljeno');
      router.push('/login');
    } catch {
      toast.error('Napaka pri posodabljanju gesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">clario.si</CardTitle>
          <CardDescription>Novo geslo</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Preverjanje povezave za ponastavitev...
              </p>
              <p className="text-sm text-muted-foreground">
                Če je bila povezava neveljavna ali pretečena, zahtevajte novo.
              </p>
              <Link href="/forgot-password" className="text-primary hover:underline text-sm">
                Zahtevaj novo povezavo
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Novo geslo</Label>
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
                <Label htmlFor="confirmPassword">Potrdi novo geslo</Label>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Posodabljanje...' : 'Posodobi geslo'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
