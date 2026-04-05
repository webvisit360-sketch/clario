// Elit B2B Scraper — Slovenian/European automotive parts supplier
import type { Seller, SearchResult } from '@clario/shared';
import { createSlovenianScraper } from './slovenian-shop.js';

export const shopId = 'elit';

export function matches(seller: Seller): boolean {
  return seller.url?.toLowerCase().includes('elit') ||
    seller.name?.toLowerCase().includes('elit');
}

const { login, search } = createSlovenianScraper('elit', 'https://www.elit.si');
export { login, search };

export async function scrape(_credentials: unknown, partNumber: string, seller: Seller): Promise<SearchResult & { seller_id: string; seller_name: string }> {
  return {
    seller_id: seller.id, seller_name: seller.name,
    price_net: null, currency: 'EUR', stock_qty: null, availability: '',
    image_url: null, part_number_found: partNumber, add_to_cart_url: null,
    status: 'error', error: 'Use B2B stream endpoint for scraping',
  };
}
