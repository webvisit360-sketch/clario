// Shared login + search logic for Slovenian B2B automotive parts suppliers.
// Used by avtoroma, gmt, elit, euroton — they all share the same form-discovery approach.

import type { Page } from 'playwright';
import type { ShopCredentials, ScrapedProduct } from '@clario/shared';

export function createSlovenianScraper(shopId: string, baseUrl: string) {
  async function login(page: Page, credentials: ShopCredentials): Promise<boolean> {
    try {
      console.log(`[${shopId}] logging in...`);

      if (credentials.sessionCookie) {
        console.log(`[${shopId}] reusing session cookie`);
        return true;
      }

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      const loginLink = await page.$('a[href*="login"], a[href*="prijava"], a[href*="account"]');
      if (loginLink) {
        await loginLink.click();
        await page.waitForLoadState('domcontentloaded');
      }

      const form = await page.waitForSelector(
        'form[action*="login"], form[action*="prijava"], form[method="post"]',
        { timeout: 8000 }
      ).catch(() => null);

      if (!form) {
        console.log(`[${shopId}] login form not found`);
        return false;
      }

      const emailInput = await page.$('input[type="email"], input[name*="email"], input[name*="user"], input[name*="uporabnik"]');
      const passInput = await page.$('input[type="password"]');

      if (!emailInput || !passInput) {
        console.log(`[${shopId}] login fields not found`);
        return false;
      }

      await emailInput.fill(credentials.username);
      await passInput.fill(credentials.password);

      const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
      } else {
        await passInput.press('Enter');
      }

      await page.waitForLoadState('domcontentloaded');

      const errorEl = await page.$('[class*="error"], [class*="napaka"], .alert-danger');
      if (errorEl) {
        const errorText = await errorEl.textContent();
        if (errorText && errorText.trim().length > 0) {
          console.log(`[${shopId}] login failed:`, errorText.trim());
          return false;
        }
      }

      console.log(`[${shopId}] login successful`);
      return true;
    } catch (err: any) {
      console.log(`[${shopId}] login error:`, err.message);
      return false;
    }
  }

  async function search(page: Page, partNumber: string): Promise<ScrapedProduct[]> {
    try {
      console.log(`[${shopId}] searching for:`, partNumber);

      const searchInput = await page.$('input[name*="search"], input[name*="iskanje"], input[type="search"], #search');
      if (searchInput) {
        await searchInput.fill(partNumber);
        await searchInput.press('Enter');
        await page.waitForLoadState('domcontentloaded');
      } else {
        const currentUrl = page.url();
        const origin = new URL(currentUrl).origin;
        await page.goto(`${origin}/search?q=${encodeURIComponent(partNumber)}`, {
          waitUntil: 'domcontentloaded',
        });
      }

      await page.waitForTimeout(2000);

      let priceNet: number | null = null;
      let productName = '';
      let stockQty: number | null = null;
      let availability = '';
      let imageUrl: string | null = null;
      const addToCartUrl: string | null = null;

      const priceSelectors = ['.price', '.cena', '[class*="price"]', '[class*="cena"]', '.product-price', '.artikel-cena'];
      for (const sel of priceSelectors) {
        const priceEl = await page.$(sel);
        if (priceEl) {
          const priceText = await priceEl.textContent();
          const match = priceText?.match(/[\d.,]+/);
          if (match) {
            priceNet = parseFloat(match[0].replace(/\./g, '').replace(',', '.'));
            break;
          }
        }
      }

      const nameSelectors = ['.product-name', '.artikel-naziv', 'h1', '.product-title', '[class*="name"]'];
      for (const sel of nameSelectors) {
        const el = await page.$(sel);
        if (el) {
          productName = (await el.textContent())?.trim() ?? '';
          if (productName) break;
        }
      }

      const stockSelectors = ['[class*="stock"]', '[class*="zaloga"]', '[class*="availability"]', '[class*="razpol"]'];
      for (const sel of stockSelectors) {
        const el = await page.$(sel);
        if (el) {
          availability = (await el.textContent())?.trim() ?? '';
          const qtyMatch = availability.match(/(\d+)/);
          if (qtyMatch) stockQty = parseInt(qtyMatch[1], 10);
          break;
        }
      }

      const imgEl = await page.$('.product-image img, [class*="product"] img, [class*="artikel"] img');
      if (imgEl) {
        imageUrl = await imgEl.getAttribute('src');
      }

      if (priceNet === null) {
        console.log(`[${shopId}] product not found for:`, partNumber);
        return [];
      }

      console.log(`[${shopId}] found product:`, productName, 'price:', priceNet);
      return [{
        partNumberFound: partNumber,
        productName,
        priceNet,
        currency: 'EUR',
        stockQty,
        availability,
        imageUrl,
        addToCartUrl,
      }];
    } catch (err: any) {
      console.log(`[${shopId}] search error:`, err.message);
      return [];
    }
  }

  return { login, search };
}
