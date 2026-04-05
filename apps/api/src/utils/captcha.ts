import { v4 as uuidv4 } from 'uuid';

interface CaptchaEntry {
  answer: number;
  expiresAt: number;
}

const captchas = new Map<string, CaptchaEntry>();

const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateCaptcha(): { id: string; question: string } {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const isAddition = Math.random() > 0.5;

  const question = isAddition ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
  const answer = isAddition ? a + b : Math.max(a, b) - Math.min(a, b);

  const id = uuidv4();
  captchas.set(id, { answer, expiresAt: Date.now() + EXPIRY_MS });

  return { id, question };
}

export function verifyCaptcha(id: string, answer: unknown): boolean {
  const captcha = captchas.get(id);
  if (!captcha) return false;

  captchas.delete(id);

  if (Date.now() > captcha.expiresAt) return false;
  return captcha.answer === Number(answer);
}

// Cleanup expired captchas periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, captcha] of captchas) {
    if (now > captcha.expiresAt) captchas.delete(id);
  }
}, 60_000);
