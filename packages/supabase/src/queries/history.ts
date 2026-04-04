import { serverClient } from '../client';
import type { SearchResult } from '@clario/shared';

export async function saveSearch(
  userId: string,
  partNumber: string,
  results: SearchResult[]
) {
  const { data, error } = await serverClient.from('search_history').insert({
    user_id: userId,
    part_number: partNumber,
    results_json: results,
    result_count: results.filter((r) => r.status === 'ok').length,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getHistory(userId: string, limit = 50) {
  const { data, error } = await serverClient
    .from('search_history')
    .select('id, part_number, result_count, searched_at')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
