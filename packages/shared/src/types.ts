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
