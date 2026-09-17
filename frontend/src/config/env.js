/**
 * Biến môi trường Vite — đọc cờ một lần tại module này.
 * Chỉ chuỗi đúng "true" mới bật mock.
 */
export const IS_TEST = import.meta.env.VITE_IS_TEST === 'true';

/**
 * Gắn axios adapter mock. Điều kiện dùng import.meta.env trực tiếp
 * để Vite/Rollup tree-shake dynamic import khi mode false.
 */
export function installMockAdapterIfNeeded(axiosClient) {
  if (import.meta.env.VITE_IS_TEST === 'true') {
    axiosClient.defaults.adapter = (config) =>
      import('../mock/adapter.js').then(({ mockAdapter }) => mockAdapter(config));
  }
}
