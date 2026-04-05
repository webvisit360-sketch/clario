import { serverClient } from '../client';
import type { TecDocSearchResult } from '@clario/shared';

export async function getCachedTecDoc(searchTerm: string): Promise<TecDocSearchResult | null> {
  const normalized = searchTerm.replace(/[\s\-\.]/g, '').toUpperCase();

  const { data, error } = await serverClient
    .from('tecdoc_cache')
    .select('results_json, expires_at')
    .eq('search_term', normalized)
    .single();

  if (error || !data) return null;

  // Check if cache has expired
  if (new Date(data.expires_at) < new Date()) return null;

  return data.results_json as TecDocSearchResult;
}

export async function cacheTecDocResult(
  searchTerm: string,
  result: TecDocSearchResult
): Promise<void> {
  const normalized = searchTerm.replace(/[\s\-\.]/g, '').toUpperCase();

  const { error } = await serverClient
    .from('tecdoc_cache')
    .upsert({
      search_term: normalized,
      brand_no: result.articles[0]?.brandNo ?? null,
      results_json: result,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

  if (error) {
    console.log('[tecdoc-cache] Failed to cache result:', error.message);
  }
}
