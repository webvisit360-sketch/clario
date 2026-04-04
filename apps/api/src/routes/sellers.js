const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const { encrypt } = require('../utils/encrypt');
const {
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,
} = require('@clario/supabase');

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

module.exports = router;
