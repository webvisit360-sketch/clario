import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { requireAuth, type AuthEnv } from '../middleware/requireAuth.js';
import { decrypt } from '../utils/encrypt.js';
import { getSellersWithCredentials, saveSearch, serverClient } from '@clario/supabase';
import { scrapeB2B } from '../services/brightDataService.js';
import { searchByNumber } from '../services/tecdocService.js';

import * as intercars from '../scrapers/intercars.js';
import * as elit from '../scrapers/elit.js';
import * as autokelly from '../scrapers/autokelly.js';
import * as gmt from '../scrapers/gmt.js';
import * as autodoc from '../scrapers/autodoc.js';
import * as avtoroma from '../scrapers/avtoroma.js';
import * as rezervniavtodeli24 from '../scrapers/rezervniavtodeli24.js';
import * as finavto from '../scrapers/finavto.js';

// Legacy scrapers for existing GET /api/search
const scrapers: Record<string, { scrape: Function }> = {
  intercars,
  elit,
  autokelly,
  gmt,
  autodoc,
  avtoroma,
  rezervniavtodeli24,
  finavto,
};

const app = new Hono<AuthEnv>();

app.use(requireAuth);

const SEARCH_TIMEOUT = 12_000;

// GET /api/search?q=PART_NUMBER — legacy endpoint
app.get('/', async (c) => {
  const partNumber = c.req.query('q');
  if (!partNumber) {
    return c.json({ error: 'Missing query parameter: q' }, 400);
  }

  const { data: sellersRaw, error } = await serverClient
    .from('sellers')
    .select('*')
    .eq('user_id', c.get('user').id)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const sellers = sellersRaw ?? [];

  const scrapePromises = sellers.map((seller: any) => {
    const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
    const credentials = { email: seller.login_email, password };

    const scraperKey = seller.name.toLowerCase().replace(/\s+/g, '');
    const scraperFn = scrapers[scraperKey];

    if (!scraperFn) {
      return Promise.resolve({
        seller_id: seller.id,
        seller_name: seller.name,
        price_net: null,
        currency: 'EUR',
        stock_qty: null,
        availability: '',
        image_url: null,
        part_number_found: partNumber,
        add_to_cart_url: null,
        status: 'error',
        error: 'No scraper implemented for this seller',
      });
    }

    return Promise.race([
      scraperFn.scrape(credentials, partNumber, seller),
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              seller_id: seller.id,
              seller_name: seller.name,
              price_net: null,
              currency: 'EUR',
              stock_qty: null,
              availability: '',
              image_url: null,
              part_number_found: partNumber,
              add_to_cart_url: null,
              status: 'timeout',
              error: 'Search timed out',
            }),
          SEARCH_TIMEOUT
        )
      ),
    ]);
  });

  const settledResults = await Promise.allSettled(scrapePromises);
  const results = settledResults.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      seller_id: sellers[i].id,
      seller_name: sellers[i].name,
      price_net: null,
      currency: 'EUR',
      stock_qty: null,
      availability: '',
      image_url: null,
      part_number_found: partNumber,
      add_to_cart_url: null,
      status: 'error',
      error: (r.reason as Error)?.message ?? 'Unknown error',
    };
  });

  await saveSearch(c.get('user').id, partNumber, results);

  return c.json({
    part_number: partNumber,
    results,
    searched_at: new Date().toISOString(),
  });
});

// GET /api/search/b2b-stream?q=PART_NUMBER — SSE endpoint
app.get('/b2b-stream', async (c) => {
  const partNumber = c.req.query('q');
  if (!partNumber) {
    return c.json({ error: 'Missing query parameter: q' }, 400);
  }

  const sellers = await getSellersWithCredentials(c.get('user').id);

  if (sellers.length === 0) {
    return c.json({ error: 'No active sellers configured' }, 404);
  }

  return streamSSE(c, async (stream) => {
    // Step 1: TecDoc cross-reference lookup
    let crossReferences: string[] = [];
    try {
      const tecdocResult = await searchByNumber(partNumber);
      crossReferences = tecdocResult.crossReferences;

      await stream.writeSSE({
        data: JSON.stringify({
          type: 'tecdoc',
          originalQuery: partNumber,
          articles: tecdocResult.articles,
          crossReferences: tecdocResult.crossReferences,
        }),
      });
    } catch (err: any) {
      console.log('[search] TecDoc lookup failed:', err.message);
      // Continue without cross-references — scrapers still work
    }

    // Step 2: B2B scraping with cross-references
    let successful = 0;

    await scrapeB2B(c.get('user').id, sellers, partNumber, (result) => {
      if (result.status === 'ok') successful++;
      stream.writeSSE({ data: JSON.stringify({ type: 'result', ...result }) });
    }, crossReferences);

    await stream.writeSSE({
      data: JSON.stringify({ type: 'done', totalShops: sellers.length, successful }),
    });
  });
});

export default app;
