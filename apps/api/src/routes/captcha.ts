import { Hono } from 'hono';
import { generateCaptcha, verifyCaptcha } from '../utils/captcha.js';

const app = new Hono();

app.post('/generate', (c) => {
  const captcha = generateCaptcha();
  return c.json(captcha);
});

app.post('/verify', async (c) => {
  const { id, answer } = await c.req.json();
  if (!id || answer === undefined) {
    return c.json({ error: 'Missing id or answer' }, 400);
  }
  const valid = verifyCaptcha(id, answer);
  return c.json({ valid });
});

export default app;
