import { chromium, type Browser, type Page } from 'playwright';
import type { Seller, SearchResult } from '@clario/shared';

export interface ScraperOptions {
  timeout?: number;
  sessionCookie?: string | null;
}

export type ScraperFn = (
  page: Page,
  credentials: unknown,
  partNumber: string | null,
  seller: Seller
) => Promise<unknown>;

let localBrowser: Browser | null = null;
let brightDataBrowser: Browser | null = null;

async function getLocalBrowser(): Promise<Browser> {
  if (!localBrowser || !localBrowser.isConnected()) {
    localBrowser = await chromium.launch({ headless: true });
  }
  return localBrowser;
}

async function getBrightDataBrowser(): Promise<Browser> {
  if (!brightDataBrowser || !brightDataBrowser.isConnected()) {
    const wss = process.env.BRIGHT_DATA_WSS;
    if (!wss) throw new Error('BRIGHT_DATA_WSS not configured');
    brightDataBrowser = await chromium.connectOverCDP(wss);
  }
  return brightDataBrowser;
}

export async function getBrowser(): Promise<Browser> {
  if (process.env.BRIGHT_DATA_WSS) {
    return getBrightDataBrowser();
  }
  return getLocalBrowser();
}

export async function runScraper(
  fn: ScraperFn,
  credentials: unknown,
  partNumber: string | null,
  seller: Seller,
  options: ScraperOptions = {}
): Promise<any> {
  const timeout = options.timeout || 20000;
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Restore session cookie if provided
  if (options.sessionCookie) {
    try {
      const cookies = JSON.parse(options.sessionCookie);
      if (Array.isArray(cookies)) {
        await context.addCookies(cookies);
      }
    } catch {
      // Invalid cookie format, proceed without session
    }
  }

  let retried = false;

  async function attempt(): Promise<any> {
    try {
      const result = await Promise.race([
        fn(page, credentials, partNumber, seller),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Scraper timeout')), timeout)
        ),
      ]);
      return result;
    } catch (err: any) {
      // Retry once on network errors
      if (!retried && err.message && (err.message.includes('net::') || err.message.includes('Navigation timeout'))) {
        retried = true;
        return attempt();
      }
      return {
        seller_id: seller.id,
        seller_name: seller.name,
        price_net: null,
        currency: 'EUR',
        stock_qty: null,
        availability: '',
        image_url: null,
        part_number_found: partNumber ?? '',
        add_to_cart_url: null,
        status: 'error',
        error: err.message,
      } satisfies SearchResult & { seller_id: string; seller_name: string };
    }
  }

  try {
    return await attempt();
  } finally {
    await context.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (localBrowser) {
    await localBrowser.close();
    localBrowser = null;
  }
  if (brightDataBrowser) {
    await brightDataBrowser.close();
    brightDataBrowser = null;
  }
}
