/** Deep clone via JSON — đủ cho fixture JSON thuần. */
export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Chuẩn hóa giống utf8mb4_unicode_ci: bỏ dấu + lower-case. */
export function normalizeSearch(str) {
  if (str == null) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Match LIKE '%keyword%' với collation bỏ dấu / không phân biệt hoa thường. */
export function likeIncludes(haystack, needle) {
  if (needle == null || String(needle).trim() === '') return true;
  return normalizeSearch(haystack).includes(normalizeSearch(needle));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay() {
  return 200 + Math.floor(Math.random() * 201);
}

export function parseQuery(url) {
  const qIndex = url.indexOf('?');
  if (qIndex < 0) return {};
  const params = new URLSearchParams(url.slice(qIndex + 1));
  const out = {};
  for (const [k, v] of params.entries()) {
    if (out[k] !== undefined) {
      out[k] = Array.isArray(out[k]) ? [...out[k], v] : [out[k], v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function getPathname(url) {
  try {
    if (url.startsWith('http')) {
      return new URL(url).pathname;
    }
  } catch {
    /* fallthrough */
  }
  const q = url.indexOf('?');
  return q >= 0 ? url.slice(0, q) : url;
}

export function resultData(status, data, total) {
  const body = {
    status,
    date: new Date().toString(),
  };
  if (data !== undefined) body.data = data;
  if (total !== undefined) body.total = total;
  return body;
}

export function resultDataMsg(status, msg, data) {
  return {
    status,
    retMsg: msg,
    date: new Date().toString(),
    ...(data !== undefined ? { data } : {}),
  };
}

export function resultOnly(status, msg) {
  return {
    status,
    retMsg: msg,
    date: new Date().toString(),
  };
}
