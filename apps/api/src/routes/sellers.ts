import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnv } from '../middleware/requireAuth.js';
import { encrypt, decrypt } from '../utils/encrypt.js';
import {
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,
  updateSellerSession,
  markLoginFailed,
} from '@clario/supabase';
import { serverClient } from '@clario/supabase';
import { runScraper } from '../scrapers/base-scraper.js';
import { findScraper } from '../services/brightDataService.js';

const app = new Hono<AuthEnv>();

app.use(requireAuth);

const createSellerSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().trim().url(),
  login_email: z.string().trim().email(),
  login_password: z.string().trim().min(1),
  notes: z.string().optional(),
});

function validationHook(result: { success: boolean; error?: z.ZodError }, c: any) {
  if (!result.success) {
    const errors = result.error!.issues.map((issue) => ({
      msg: issue.message,
      param: issue.path.join('.'),
      location: 'body',
    }));
    return c.json({ errors }, 400);
  }
}

// GET /api/sellers
app.get('/', async (c) => {
  const sellers = await getSellers(c.get('user').id);
  return c.json(sellers);
});

// POST /api/sellers
app.post('/', zValidator('json', createSellerSchema, validationHook), async (c) => {
  const { name, url, login_email, login_password, notes } = c.req.valid('json');
  const { encrypted, iv } = encrypt(login_password);

  const seller = await createSeller(c.get('user').id, {
    name,
    url,
    login_email,
    login_password,
    login_password_encrypted: encrypted,
    login_password_iv: iv,
    notes,
  });

  const { login_password_encrypted, login_password_iv, ...safe } = seller;
  return c.json(safe, 201);
});

// PUT /api/sellers/:id
app.put('/:id', async (c) => {
  const updates: Record<string, unknown> = await c.req.json();
  delete updates.id;
  delete updates.user_id;

  if (updates.login_password) {
    const { encrypted, iv } = encrypt(updates.login_password as string);
    updates.login_password_encrypted = encrypted;
    updates.login_password_iv = iv;
    delete updates.login_password;
  }

  const seller = await updateSeller(c.req.param('id'), c.get('user').id, updates);
  const { login_password_encrypted, login_password_iv, ...safe } = seller;
  return c.json(safe);
});

// DELETE /api/sellers/:id
app.delete('/:id', async (c) => {
  await deleteSeller(c.req.param('id'), c.get('user').id);
  return c.body(null, 204);
});

// POST /api/sellers/:id/test — Test login for a specific seller
app.post('/:id/test', async (c) => {
  const { data: seller, error } = await serverClient
    .from('sellers')
    .select('*')
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('user').id)
    .single();

  if (error || !seller) {
    return c.json({ error: 'Seller not found' }, 404);
  }

  const scraper = findScraper(seller);
  if (!scraper) {
    return c.json({ error: 'No scraper implemented for this seller' }, 400);
  }

  const password = decrypt(seller.login_password_encrypted, seller.login_password_iv);
  const credentials = {
    username: seller.login_email,
    password,
    sessionCookie: null,
  };

  const result = await runScraper(
    async (page, creds) => {
      const success = await scraper.login(page, creds as any);
      return { success };
    },
    credentials,
    null,
    seller,
    { timeout: 15000 }
  );

  const loginSuccess = result.success === true;
  const loginStatus = loginSuccess ? 'ok' as const : 'failed' as const;
  const testedAt = new Date().toISOString();

  if (loginSuccess) {
    await updateSellerSession(seller.id, c.get('user').id, {
      session_cookie: '',
      session_expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      last_login_at: testedAt,
      login_status: 'ok',
    });
  } else {
    await markLoginFailed(seller.id, c.get('user').id);
  }

  return c.json({ success: loginSuccess, login_status: loginStatus, tested_at: testedAt });
});

export default app;
