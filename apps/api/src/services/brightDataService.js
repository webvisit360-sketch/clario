const { decrypt } = require('../utils/encrypt');
const { updateSellerSession, markLoginFailed } = require('@clario/supabase');
const { runScraper } = require('../scrapers/base-scraper');

// Import all B2B scrapers
const b2bScrapers = [
  require('../scrapers/autodoc'),
  require('../scrapers/avtoroma'),
  require('../scrapers/gmt'),
  require('../scrapers/elit'),
  require('../scrapers/euroton'),
];

/**
 * Find the matching scraper for a seller based on URL or name.
 */
function findScraper(seller) {
  return b2bScrapers.find((s) => s.matches(seller)) || null;
}

/**
 * Check if a cached session is still valid.
 */
function isSessionValid(seller) {
  if (!seller.session_cookie || !seller.session_expires_at) return false;
  return new Date(seller.session_expires_at) > new Date();
}

/**
 * Scrape B2B shops in parallel.
 * @param {string} userId
 * @param {import('@clario/shared').SellerWithCredentials[]} sellers
 * @param {string} partNumber
 * @param {(result: import('@clario/shared').B2BSearchResult) => void} onResult
 */
async function scrapeB2B(userId, sellers, partNumber, onResult) {
  const promises = sellers.map(async (seller) => {
    const scraper = findScraper(seller);

    if (!scraper) {
      const result = {
        sellerId: seller.id,
        sellerName: seller.name,
        status: 'error',
        error: 'No scraper implemented for this seller',
      };
      onResult(result);
      return result;
    }

    try {
      // Decrypt credentials
      const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
      const credentials = {
        username: seller.login_email,
        password,
        sessionCookie: isSessionValid(seller) ? seller.session_cookie : null,
      };

      // Run login + search in a single browser context via runScraper
      const scraperResult = await runScraper(
        async (page, creds, pn, s) => {
          // Step 1: Login
          const loggedIn = await scraper.login(page, creds);
          if (!loggedIn) {
            return {
              sellerId: s.id,
              sellerName: s.name,
              status: 'login_failed',
              error: 'Login failed',
            };
          }

          // Save session cookies after successful login
          try {
            const context = page.context();
            const cookies = await context.cookies();
            const cookieJson = JSON.stringify(cookies);
            const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // +4h

            await updateSellerSession(s.id, userId, {
              session_cookie: cookieJson,
              session_expires_at: expiresAt,
              last_login_at: new Date().toISOString(),
              login_status: 'ok',
            });
          } catch (err) {
            console.log(`[${scraper.shopId}] failed to save session:`, err.message);
          }

          // Step 2: Search
          const products = await scraper.search(page, pn);

          if (!products || products.length === 0) {
            return {
              sellerId: s.id,
              sellerName: s.name,
              status: 'not_found',
            };
          }

          return {
            sellerId: s.id,
            sellerName: s.name,
            status: 'ok',
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

      // runScraper may return an error-shaped object from its catch block
      const result = scraperResult.status === 'error' && scraperResult.seller_id
        ? {
            sellerId: scraperResult.seller_id,
            sellerName: scraperResult.seller_name,
            status: scraperResult.error?.includes('timeout') ? 'timeout' : 'error',
            error: scraperResult.error,
          }
        : scraperResult;

      onResult(result);
      return result;
    } catch (err) {
      // Mark login as failed if it's an auth error
      try {
        await markLoginFailed(seller.id, userId);
      } catch {
        // Ignore DB errors here
      }

      const result = {
        sellerId: seller.id,
        sellerName: seller.name,
        status: 'error',
        error: err.message,
      };
      onResult(result);
      return result;
    }
  });

  // Never stop because of one shop
  await Promise.allSettled(promises);
}

module.exports = { scrapeB2B, findScraper };
