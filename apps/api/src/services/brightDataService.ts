import { decrypt } from '../utils/encrypt.js';
import { updateSellerSession, markLoginFailed } from '@clario/supabase';
import { runScraper } from '../scrapers/base-scraper.js';
import type { Seller, SellerWithCredentials, B2BSearchResult } from '@clario/shared';

import * as autodoc from '../scrapers/autodoc.js';
import * as avtoroma from '../scrapers/avtoroma.js';
import * as gmt from '../scrapers/gmt.js';
import * as elit from '../scrapers/elit.js';
import * as euroton from '../scrapers/euroton.js';

interface B2BScraper {
  shopId: string;
  matches(seller: Seller): boolean;
  login(page: import('playwright').Page, credentials: import('@clario/shared').ShopCredentials): Promise<boolean>;
  search(page: import('playwright').Page, partNumber: string): Promise<import('@clario/shared').ScrapedProduct[]>;
}

const b2bScrapers: B2BScraper[] = [autodoc, avtoroma, gmt, elit, euroton];

export function findScraper(seller: Seller): B2BScraper | null {
  return b2bScrapers.find((s) => s.matches(seller)) ?? null;
}

function isSessionValid(seller: SellerWithCredentials): boolean {
  if (!seller.session_expires_at) return false;
  return new Date(seller.session_expires_at) > new Date();
}

export async function scrapeB2B(
  userId: string,
  sellers: SellerWithCredentials[],
  partNumber: string,
  onResult: (result: B2BSearchResult) => void
): Promise<void> {
  const promises = sellers.map(async (seller) => {
    const scraper = findScraper(seller);

    if (!scraper) {
      const result: B2BSearchResult = {
        sellerId: seller.id,
        sellerName: seller.name,
        status: 'error',
        error: 'No scraper implemented for this seller',
      };
      onResult(result);
      return result;
    }

    try {
      const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
      const credentials = {
        username: seller.login_email,
        password,
        sessionCookie: isSessionValid(seller) ? (seller as any).session_cookie : null,
      };

      const scraperResult = await runScraper(
        async (page, creds, pn, s) => {
          const loggedIn = await scraper.login(page, creds as any);
          if (!loggedIn) {
            return {
              sellerId: s.id,
              sellerName: s.name,
              status: 'login_failed' as const,
              error: 'Login failed',
            };
          }

          try {
            const context = page.context();
            const cookies = await context.cookies();
            const cookieJson = JSON.stringify(cookies);
            const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

            await updateSellerSession(s.id, userId, {
              session_cookie: cookieJson,
              session_expires_at: expiresAt,
              last_login_at: new Date().toISOString(),
              login_status: 'ok',
            });
          } catch (err: any) {
            console.log(`[${scraper.shopId}] failed to save session:`, err.message);
          }

          const products = await scraper.search(page, pn!);

          if (!products || products.length === 0) {
            return {
              sellerId: s.id,
              sellerName: s.name,
              status: 'not_found' as const,
            };
          }

          return {
            sellerId: s.id,
            sellerName: s.name,
            status: 'ok' as const,
            product: products[0],
          };
        },
        credentials,
        partNumber,
        seller,
        {
          timeout: 20000,
          sessionCookie: credentials.sessionCookie,
        }
      );

      const result: B2BSearchResult = scraperResult.status === 'error' && scraperResult.seller_id
        ? {
            sellerId: scraperResult.seller_id,
            sellerName: scraperResult.seller_name,
            status: scraperResult.error?.includes('timeout') ? 'timeout' : 'error',
            error: scraperResult.error,
          }
        : scraperResult;

      onResult(result);
      return result;
    } catch (err: any) {
      try {
        await markLoginFailed(seller.id, userId);
      } catch {
        // Ignore DB errors here
      }

      const result: B2BSearchResult = {
        sellerId: seller.id,
        sellerName: seller.name,
        status: 'error',
        error: err.message,
      };
      onResult(result);
      return result;
    }
  });

  await Promise.allSettled(promises);
}
