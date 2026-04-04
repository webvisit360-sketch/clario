import { serverClient } from '../client';
import type { SearchResult, HistoryEntry } from '@clario/shared';

export async function saveSearch(
  userId: string,
  partNumber: string,
  results: SearchResult[]
): Promise<void> {
  const { error } = await serverClient.from('search_history').insert({
    user_id: userId,
    part_number: partNumber,
    results_json: results,
    result_count: results.filter((r) => r.status === 'ok').length,
  });

  if (error) throw error;
}

export async function getHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const { data, error } = await serverClient
    .from('search_history')
    .select('id, part_number, result_count, searched_at')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
