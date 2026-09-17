/**
 * JWT mock 3 đoạn (header.payload.signature) có exp.
 * Frontend hiện không verify chữ ký — chỉ lưu token.
 */

function b64url(obj) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createMockJwt(username, role, expiresInSec = 86400) {
  const header = b64url({ alg: 'HS512', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url({
    sub: username,
    role,
    iat: now,
    exp: now + expiresInSec,
  });
  const signature = b64url(`mock-sig-${username}-${role}`);
  return `${header}.${payload}.${signature}`;
}

export function parseMockJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = decodeURIComponent(
      escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    );
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { ...payload, expired: true };
    }
    return payload;
  } catch {
    return null;
  }
}

export function extractBearer(config) {
  const h = config.headers || {};
  const auth =
    h.Authorization ||
    h.authorization ||
    (typeof h.get === 'function' ? h.get('Authorization') || h.get('authorization') : null);
  if (!auth || typeof auth !== 'string') return null;
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return auth;
}

export function getAuthUser(config, store) {
  const token = extractBearer(config);
  if (!token) return null;
  const payload = parseMockJwt(token);
  if (!payload || payload.expired) return null;
  const user = store.users.find((u) => u.username === payload.sub);
  if (!user) return null;
  return { user, role: payload.role || user.role, token, payload };
}
