import { serverClient } from '../client';
import type { User } from '@clario/shared';

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await serverClient
    .from('profiles')
    .select('id, email, company_name')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function createProfile(
  userId: string,
  email: string,
  companyName: string
): Promise<User> {
  const { data, error } = await serverClient
    .from('profiles')
    .insert({ id: userId, email, company_name: companyName })
    .select('id, email, company_name')
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProfile(data: {
  id: string;
  email: string;
  company_name: string;
}): Promise<User> {
  const { data: profile, error } = await serverClient
    .from('profiles')
    .upsert(data)
    .select('id, email, company_name')
    .single();

  if (error) throw error;
  return profile;
}
