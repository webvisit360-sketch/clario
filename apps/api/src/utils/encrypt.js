const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.AES_KEY;

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

function decrypt(encrypted, iv) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(KEY, 'utf8'),
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
