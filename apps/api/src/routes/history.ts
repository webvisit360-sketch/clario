import { Hono } from 'hono';
import { requireAuth, type AuthEnv } from '../middleware/requireAuth.js';
import { getHistory } from '@clario/supabase';

const app = new Hono<AuthEnv>();

app.use(requireAuth);

app.get('/', async (c) => {
  const history = await getHistory(c.get('user').id, 50);
  return c.json(history);
});

export default app;
