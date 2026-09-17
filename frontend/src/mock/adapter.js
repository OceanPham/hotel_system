import { deepClone, getPathname, parseQuery, randomDelay, sleep } from './utils.js';
import { routeMockRequest } from './handlers/index.js';

function parseBody(config) {
  if (config.data == null) return null;
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data);
    } catch {
      return config.data;
    }
  }
  return config.data;
}

/**
 * Axios custom adapter — chặn MỌI request khi IS_TEST.
 * Trả shape axios: { data, status, statusText, headers, config }.
 * Deep clone data để component mutate không làm bẩn store.
 */
export async function mockAdapter(config) {
  await sleep(randomDelay());

  const method = (config.method || 'get').toUpperCase();
  const rawUrl = config.url || '';
  // axios có thể ghép baseURL — lấy pathname từ url đầy đủ hoặc tương đối
  let full = rawUrl;
  if (config.baseURL && !rawUrl.startsWith('http')) {
    full = `${config.baseURL.replace(/\/$/, '')}/${rawUrl.replace(/^\//, '')}`;
  }
  const pathname = getPathname(full);
  const query = { ...parseQuery(full), ...(config.params || {}) };
  const body = parseBody(config);

  const result = await routeMockRequest({
    method,
    pathname,
    body,
    config,
    query,
  });

  const response = {
    data: deepClone(result.data),
    status: result.status,
    statusText: result.status >= 200 && result.status < 300 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json', 'x-mock': 'true' },
    config,
    request: {},
  };

  // Axios coi status ngoài 2xx là lỗi — mirror hành vi đó
  const validate = config.validateStatus || ((s) => s >= 200 && s < 300);
  if (!validate(response.status)) {
    const error = new Error(
      `Request failed with status code ${response.status}`
    );
    error.config = config;
    error.response = response;
    error.isAxiosError = true;
    error.toJSON = () => ({ message: error.message, status: response.status });
    return Promise.reject(error);
  }

  return response;
}
