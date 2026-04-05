import { serverClient } from '@clario/supabase';
import { createMiddleware } from 'hono/factory';

export type AuthEnv = {
  Variables: {
    user: { id: string; email?: string; [key: string]: unknown };
  };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization token' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await serverClient.auth.getUser(token);
    if (error || !data.user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    c.set('user', data.user as any);
    await next();
  } catch {
    return c.json({ error: 'Authentication failed' }, 401);
  }
});
