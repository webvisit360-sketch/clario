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
  data: SellerCreateInput & { login_password_encrypted: string; login_password_iv: string }
): Promise<Seller> {
  const { data: seller, error } = await serverClient
    .from('sellers')
    .insert({
      user_id: userId,
      name: data.name,
      url: data.url,
      login_email: data.login_email,
      login_password_encrypted: data.login_password_encrypted,
      login_password_iv: data.login_password_iv,
      notes: data.notes,
      active: true,
      sort_order: 0,
    })
    .select('id, user_id, name, url, login_email, notes, active, sort_order')
    .single();

  if (error) throw error;
  return seller;
}

export async function updateSeller(
  id: string,
  userId: string,
  data: Partial<SellerCreateInput & { login_password_encrypted: string; login_password_iv: string; active: boolean; sort_order: number }>
): Promise<Seller> {
  const { data: seller, error } = await serverClient
    .from('sellers')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, user_id, name, url, login_email, notes, active, sort_order')
    .single();

  if (error) throw error;
  return seller;
}

export async function deleteSeller(id: string, userId: string): Promise<void> {
  const { error } = await serverClient
    .from('sellers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
