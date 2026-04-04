import { serverClient } from '../client';

export async function getProfile(userId: string) {
  const { data, error } = await serverClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function createProfile(userId: string, email: string, companyName: string) {
  const { data, error } = await serverClient.from('profiles').insert({
    id: userId,
    email,
    company_name: companyName,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: {
  id: string;
  email: string;
  company_name: string;
}) {
  const { data, error } = await serverClient
    .from('profiles')
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}
