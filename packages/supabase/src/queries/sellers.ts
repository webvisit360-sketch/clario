import { serverClient } from '../client';
import type { Seller, SellerCreateInput } from '@clario/shared';

export async function getSellers(userId: string): Promise<Seller[]> {
  const { data, error } = await serverClient
    .from('sellers')
    .select('id, user_id, name, url, login_email, notes, active, sort_order')
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
