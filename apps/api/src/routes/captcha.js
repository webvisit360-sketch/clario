const { Router } = require('express');
const { generateCaptcha, verifyCaptcha } = require('../utils/captcha');

const router = Router();

router.post('/generate', (req, res) => {
  const captcha = generateCaptcha();
  res.json(captcha);
});

router.post('/verify', (req, res) => {
  const { id, answer } = req.body;
  if (!id || answer === undefined) {
    return res.status(400).json({ error: 'Missing id or answer' });
  }
  const valid = verifyCaptcha(id, answer);
  res.json({ valid });
});

module.exports = router;
