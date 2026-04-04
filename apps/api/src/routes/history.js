const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getHistory } = require('@clario/supabase');

const router = Router();

router.use(requireAuth);

// GET /api/history
router.get('/', async (req, res, next) => {
  try {
    const history = await getHistory(req.user.id, 50);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
