const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const { decrypt } = require('../utils/encrypt');
const { getSellers, saveSearch } = require('@clario/supabase');

// Import all scrapers
const scrapers = {
  intercars: require('../scrapers/intercars'),
  elit: require('../scrapers/elit'),
  autokelly: require('../scrapers/autokelly'),
  gmt: require('../scrapers/gmt'),
  autodoc: require('../scrapers/autodoc'),
  avtoroma: require('../scrapers/avtoroma'),
  rezervniavtodeli24: require('../scrapers/rezervniavtodeli24'),
  finavto: require('../scrapers/finavto'),
};

const router = Router();

router.use(requireAuth);

const SEARCH_TIMEOUT = 12_000;

// GET /api/search?q=PART_NUMBER
router.get('/', async (req, res, next) => {
  const partNumber = req.query.q;
  if (!partNumber || typeof partNumber !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  try {
    // Get user's active sellers with encrypted credentials
    const { data: sellersRaw, error } = await require('@clario/supabase')
      .serverClient.from('sellers')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const sellers = sellersRaw ?? [];

    // Run scrapers in parallel with timeout
    const scrapePromises = sellers.map((seller) => {
      const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
      const credentials = { email: seller.login_email, password };

      // Find matching scraper by seller name (lowercase, no spaces)
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
        error: r.reason?.message ?? 'Unknown error',
      };
    });

    // Save to history
    await saveSearch(req.user.id, partNumber, results);

    res.json({
      part_number: partNumber,
      results,
      searched_at: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
