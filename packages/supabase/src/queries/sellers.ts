import { serverClient } from '../client';
import type { Seller, SellerCreateInput, SellerWithCredentials } from '@clario/shared';

export async function getSellers(userId: string): Promise<Seller[]> {
  const { data, error } = await serverClient
    .from('sellers')
    .select('id, user_id, name, url, login_email, notes, active, sort_order, login_status, last_login_at')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createSeller(
  userId: string,
  input: SellerCreateInput & { login_password_encrypted: string; login_password_iv: string }
) {
  const { data, error } = await serverClient.from('sellers').insert({
    user_id: userId,
    name: input.name,
    url: input.url,
    login_email: input.login_email,
    login_password_encrypted: input.login_password_encrypted,
    login_password_iv: input.login_password_iv,
    notes: input.notes ?? null,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function updateSeller(
  id: string,
  userId: string,
  updates: Partial<Omit<Seller, 'id' | 'user_id'>> & {
    login_password_encrypted?: string;
    login_password_iv?: string;
  }
) {
  const { data, error } = await serverClient
    .from('sellers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSeller(id: string, userId: string) {
  const { error } = await serverClient
    .from('sellers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// B2B Scraping — Session Cache Functions
// ─────────────────────────────────────────────

export async function updateSellerSession(
  sellerId: string,
  userId: string,
  data: {
    session_cookie: string;
    session_expires_at: string;
    last_login_at: string;
    login_status: 'ok' | 'failed' | 'expired' | 'unknown';
  }
): Promise<void> {
  const { error } = await serverClient
    .from('sellers')
    .update({
      session_cookie: data.session_cookie,
      session_expires_at: data.session_expires_at,
      last_login_at: data.last_login_at,
      login_status: data.login_status,
    })
    .eq('id', sellerId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function markLoginFailed(sellerId: string, userId: string): Promise<void> {
  const { error } = await serverClient
    .from('sellers')
    .update({
      login_status: 'failed',
      last_login_at: new Date().toISOString(),
      session_cookie: null,
      session_expires_at: null,
    })
    .eq('id', sellerId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getSellersWithCredentials(userId: string): Promise<SellerWithCredentials[]> {
  const { data, error } = await serverClient
    .from('sellers')
    .select('id, user_id, name, url, login_email, login_password_encrypted, login_password_iv, notes, active, sort_order, login_status, last_login_at, session_cookie, session_expires_at')
    .eq('user_id', userId)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SellerWithCredentials[];
}
