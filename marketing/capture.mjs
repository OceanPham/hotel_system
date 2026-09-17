/**
 * Chụp ảnh marketing HTMS — viewport 1440×900, fullPage: false
 * Yêu cầu: frontend mock đang chạy tại http://localhost:4200
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'images');
const BASE = process.env.MARKETING_BASE_URL || 'http://localhost:4200';
const VIEWPORT = { width: 1440, height: 900 };

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.waitForTimeout(500);
  await page.screenshot({ path: file, fullPage: false, type: 'png' });
  console.log('✓', name);
}

async function waitContent(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
  await page.waitForFunction(
    () => !document.querySelector('.ant-spin-spinning'),
    { timeout: 20000 }
  ).catch(() => {});
  await page.waitForTimeout(800);
}

async function scrollToText(page, text) {
  await page.evaluate((t) => {
    const nodes = [...document.querySelectorAll('h1, h2, h3, span, p')];
    const el = nodes.find((h) => (h.textContent || '').includes(t));
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, text);
  await page.waitForTimeout(600);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  // --- HOME ---
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '01-home-hero.png');

  await scrollToText(page, 'Câu Chuyện Thương Hiệu');
  await shot(page, '02-home-story.png');

  await scrollToText(page, 'Bộ Sưu Tập Phòng');
  await shot(page, '03-home-rooms.png');

  await scrollToText(page, 'Dịch Vụ & Tiện Ích');
  await shot(page, '04-home-services.png');

  await scrollToText(page, 'Đánh Giá Từ Khách Hàng');
  await shot(page, '05-home-feedbacks.png');

  await scrollToText(page, 'Kỳ Nghỉ Trong Mơ');
  await shot(page, '06-home-cta.png');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const labels = [...document.querySelectorAll('label')];
    const lab = labels.find((l) => (l.textContent || '').includes('Ngày Nhận'));
    lab?.closest('.w-full.max-w-5xl')?.scrollIntoView({ block: 'center' });
  });
  await shot(page, '16-quick-booking.png');

  // --- ROOMS ---
  await page.goto(BASE + '/rooms', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '07-rooms-list.png');

  await page.evaluate(() => {
    const filter = document.querySelector('.shadow-xl.border');
    if (filter) filter.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  await shot(page, '08-rooms-filters.png');

  // --- ROOM DETAIL + BOOKING MODAL ---
  await page.goto(BASE + '/rooms/1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '09-room-detail.png');

  // Click book via evaluate (sticky button may be covered)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      (b.textContent || '').includes('Đặt Phòng Này Ngay')
    );
    if (btn) {
      btn.scrollIntoView({ block: 'center' });
      btn.click();
    }
  });
  await page.waitForSelector('.ant-modal-wrap', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(700);
  await shot(page, '14-booking-modal.png');
  await page.evaluate(() => {
    const close = document.querySelector('.ant-modal-close');
    if (close) close.click();
    else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
  await page.waitForTimeout(500);

  // --- SERVICES ---
  await page.goto(BASE + '/services', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '10-services-page.png');

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      (b.textContent || '').includes('Đăng Ký Trải Nghiệm')
    );
    btn?.click();
  });
  await page.waitForSelector('.ant-modal-wrap', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600);
  await shot(page, '11-service-booking.png');
  await page.evaluate(() => document.querySelector('.ant-modal-close')?.click());
  await page.waitForTimeout(400);

  // --- CONTACT ---
  await page.goto(BASE + '/contact', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '12-contact-page.png');

  // --- AUTH LOGIN ---
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /Đăng nhập/i.test(b.textContent || '')
    );
    btn?.click();
  });
  await page.waitForSelector('.ant-modal-wrap', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600);
  await shot(page, '13-auth-login.png');

  // Quick-fill demo guest (ttb) + submit (UI); history shot dùng session inject nếu cần
  await page.evaluate(() => {
    const quick = [...document.querySelectorAll('button')].find((b) =>
      (b.textContent || '').includes('ttb')
    );
    quick?.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const submit = [...document.querySelectorAll('.ant-modal-content button')].find((b) =>
      (b.textContent || '').includes('Đăng Nhập Vào Hệ Thống')
    );
    submit?.click();
  });
  await page.waitForTimeout(2500);

  // Fallback: inject session nếu UI login chưa kịp lưu token
  await page.evaluate(() => {
    if (localStorage.getItem('token')) return;
    const b64 = (obj) =>
      btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    const now = Math.floor(Date.now() / 1000);
    const token = `${b64({ alg: 'HS512', typ: 'JWT' })}.${b64({
      sub: 'ttb',
      role: 'USER',
      iat: now,
      exp: now + 86400,
    })}.${b64('mock-sig-ttb-USER')}`;
    const user = {
      id: 3,
      username: 'ttb',
      fullName: 'Trần Thị Bình',
      role: 'USER',
      status: 'Active',
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  });

  // --- BOOKING HISTORY ---
  await page.goto(BASE + '/bookinghistory', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitContent(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '15-booking-history.png');

  await browser.close();
  console.log('\nDone. Screenshots in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
