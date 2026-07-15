import crypto from 'crypto';

const QR_SECRET = () => process.env.QR_SECRET || 'ambika_qr_hmac_secret_key';

export const generateTableToken = (tableNumber) => {
  const payload = JSON.stringify({ table: tableNumber, ts: Date.now() });
  const signature = crypto
    .createHmac('sha256', QR_SECRET())
    .update(payload)
    .digest('hex');
  const token = Buffer.from(`${payload}|${signature}`).toString('base64url');
  return token;
};

export const verifyTableToken = (token) => {
  try {
    if (!token) return null;
    // Strip trailing slashes, spaces, query parameters, or hashes
    const cleanToken = String(token).split('?')[0].split('#')[0].replace(/\/+$/, "").trim();

    const decoded = Buffer.from(cleanToken, 'base64url').toString('utf8');
    const [payload, signature] = decoded.split('|');
    if (!payload || !signature) return null;

    const expected = crypto
      .createHmac('sha256', QR_SECRET())
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const data = JSON.parse(payload);
    return { tableNumber: data.table };
  } catch {
    return null;
  }
};
