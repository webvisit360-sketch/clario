export interface User {
  id: string;
  email: string;
  company_name: string;
}

export interface Seller {
  id: string;
  user_id: string;
  name: string;
  url: string;
  login_email: string;
  notes?: string;
  active: boolean;
  sort_order: number;
  session_expires_at?: string | null;
  last_login_at?: string | null;
  login_status?: 'ok' | 'failed' | 'expired' | 'unknown';
}

export interface SellerCreateInput {
  name: string;
  url: string;
  login_email: string;
  login_password: string;
  notes?: string;
}

export interface SearchResult {
  seller_id: string;
  seller_name: string;
  price_net: number | null;
  currency: string;
  stock_qty: number | null;
  availability: string;
  image_url: string | null;
  part_number_found: string;
  add_to_cart_url: string | null;
  status: 'ok' | 'not_found' | 'timeout' | 'error';
  error?: string;
}

export interface SearchResponse {
  part_number: string;
  results: SearchResult[];
  searched_at: string;
}

export interface CaptchaQuestion {
  id: string;
  question: string;
}

export interface HistoryEntry {
  id: string;
  part_number: string;
  result_count: number;
  searched_at: string;
}

// ─────────────────────────────────────────────
// B2B Scraping Module Types
// ─────────────────────────────────────────────

export interface ShopScraper {
  shopId: string;
  login(page: any, credentials: ShopCredentials): Promise<boolean>;
  search(page: any, partNumber: string): Promise<ScrapedProduct[]>;
}

export interface ShopCredentials {
  username: string;
  password: string;
  sessionCookie?: string | null;
}

export interface ScrapedProduct {
  partNumberFound: string;
  productName: string;
  priceNet: number | null;
  currency: string;
  stockQty: number | null;
  availability: string;
  imageUrl: string | null;
  addToCartUrl: string | null;
}

export interface B2BSearchResult {
  sellerId: string;
  sellerName: string;
  status: 'ok' | 'not_found' | 'login_failed' | 'timeout' | 'error';
  product?: ScrapedProduct;
  error?: string;
}

export interface SSEResult extends B2BSearchResult {
  type: 'result';
}

export interface SSEDone {
  type: 'done';
  totalShops: number;
  successful: number;
}

export interface SellerWithCredentials extends Seller {
  login_password_encrypted: string;
  login_password_iv: string;
}

// ─────────────────────────────────────────────
// TecDoc Integration Types
// ─────────────────────────────────────────────

export interface TecDocArticle {
  brandNo: number;
  brandName: string;
  articleNo: string;
  genericArticleNo: number;
  genericArticleName: string;
  oeNumbers: string[];
  tradeNumbers: string[];
}

export interface TecDocSearchResult {
  query: string;
  articles: TecDocArticle[];
  crossReferences: string[];
  source: 'api' | 'cache' | 'mock';
}

export interface SSETecDoc {
  type: 'tecdoc';
  originalQuery: string;
  articles: TecDocArticle[];
  crossReferences: string[];
}
