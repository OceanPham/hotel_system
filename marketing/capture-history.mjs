/** Chụp lịch sử đặt phòng với session demo (inject localStorage) */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'images');
const BASE = 'http://localhost:4200';

function b64url(obj) {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createMockJwt(username, role) {
  const header = b64url({ alg: 'HS512', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url({ sub: username, role, iat: now, exp: now + 86400 });
  const signature = b64url(`mock-sig-${username}-${role}`);
  return `${header}.${payload}.${signature}`;
}

const user = {
  id: 3,
  username: 'ttb',
  fullName: 'Trần Thị Bình',
  phone: '+84876557737',
  email: 'oceanpham0102@gmail.com',
  gender: 'Nữ',
  nationality: 'Vietnam',
  role: 'USER',
  status: 'Active',
};
const token = createMockJwt('ttb', 'USER');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'vi-VN',
});

await context.addInitScript(
  ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  { token, user }
);

const page = await context.newPage();
await page.goto(BASE + '/bookinghistory', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.waitForFunction(() => !document.querySelector('.ant-spin-spinning'), { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollTo(0, 0));

const body = await page.textContent('body');
if (body.includes('Vui lòng đăng nhập')) {
  console.error('FAIL: still login gate');
  process.exit(1);
}
if (!/Mã đơn|#\d+|Đã Xác Nhận|Đã Hoàn Tất|Chưa có đơn/i.test(body)) {
  console.warn('WARN: unexpected history content');
}

await page.screenshot({ path: path.join(OUT, '15-booking-history.png'), fullPage: false });
console.log('✓ 15-booking-history.png');
await browser.close();
