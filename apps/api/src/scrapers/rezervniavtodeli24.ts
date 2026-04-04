import type { Seller, SearchResult } from '@clario/shared';

export async function scrape(_credentials: unknown, partNumber: string, seller: Seller): Promise<SearchResult & { seller_id: string; seller_name: string }> {
  return {
    seller_id: seller.id, seller_name: seller.name,
    price_net: null, currency: 'EUR', stock_qty: null, availability: '',
    image_url: null, part_number_found: partNumber, add_to_cart_url: null,
    status: 'error', error: 'Not implemented',
  };
}
