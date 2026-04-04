const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const { encrypt, decrypt } = require('../utils/encrypt');
const {
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,
  updateSellerSession,
  markLoginFailed,
} = require('@clario/supabase');
const { runScraper } = require('../scrapers/base-scraper');
const { findScraper } = require('../services/brightDataService');

const router = Router();

router.use(requireAuth);

// GET /api/sellers
router.get('/', async (req, res, next) => {
  try {
    const sellers = await getSellers(req.user.id);
    res.json(sellers);
  } catch (err) {
    next(err);
  }
});

// POST /api/sellers
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('url').trim().isURL(),
    body('login_email').trim().isEmail(),
    body('login_password').trim().notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, url, login_email, login_password, notes } = req.body;
      const { encrypted, iv } = encrypt(login_password);

      const seller = await createSeller(req.user.id, {
        name,
        url,
        login_email,
        login_password: login_password,
        login_password_encrypted: encrypted,
        login_password_iv: iv,
        notes,
      });

      // Never return encrypted password
      const { login_password_encrypted, login_password_iv, ...safe } = seller;
      res.status(201).json(safe);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/sellers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    delete updates.user_id;

    if (updates.login_password) {
      const { encrypted, iv } = encrypt(updates.login_password);
      updates.login_password_encrypted = encrypted;
      updates.login_password_iv = iv;
      delete updates.login_password;
    }

    const seller = await updateSeller(req.params.id, req.user.id, updates);
    const { login_password_encrypted, login_password_iv, ...safe } = seller;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sellers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteSeller(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/sellers/:id/test — Test login for a specific seller
router.post('/:id/test', async (req, res, next) => {
  try {
    // Get seller with credentials from DB
    const { data: seller, error } = await require('@clario/supabase')
      .serverClient.from('sellers')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const scraper = findScraper(seller);
    if (!scraper) {
      return res.status(400).json({ error: 'No scraper implemented for this seller' });
    }

    const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
    const credentials = {
      username: seller.login_email,
      password,
      sessionCookie: null,
    };

    const result = await runScraper(
      async (page, creds) => {
        const success = await scraper.login(page, creds);
        return { success };
      },
      credentials,
      null,
      seller,
      { timeout: 15000 }
    );

    const loginSuccess = result.success === true;
    const loginStatus = loginSuccess ? 'ok' : 'failed';
    const testedAt = new Date().toISOString();

    if (loginSuccess) {
      await updateSellerSession(seller.id, req.user.id, {
        session_cookie: '',
        session_expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        last_login_at: testedAt,
        login_status: 'ok',
      });
    } else {
      await markLoginFailed(seller.id, req.user.id);
    }

    res.json({ success: loginSuccess, login_status: loginStatus, tested_at: testedAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
