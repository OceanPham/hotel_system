/**
 * Self-test mock layer (không phụ thuộc cổng TCP / backend).
 * Chạy: npx vite-node scripts/mock-selftest.mjs
 */
import { resetStore, getStore } from '../src/mock/store.js';
import { mockAdapter } from '../src/mock/adapter.js';
import { createMockJwt } from '../src/mock/auth.js';
import { likeIncludes, normalizeSearch } from '../src/mock/utils.js';

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('  OK', msg);
}

async function call(method, url, { data, token, params } = {}) {
  const config = {
    method,
    url,
    baseURL: 'http://localhost:8085',
    data,
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    validateStatus: () => true,
  };
  try {
    const res = await mockAdapter(config);
    return res;
  } catch (err) {
    if (err.response) return err.response;
    throw err;
  }
}

async function main() {
  console.log('=== Mock self-test ===');
  resetStore();

  // Collation-like search
  assert(normalizeSearch('Nguyễn') === 'nguyen', 'normalize strips accents');
  assert(likeIncludes('Garden Deluxe', 'deluxe'), 'likeIncludes case-insensitive');
  assert(likeIncludes('Nguyễn Thị Minh', 'minh'), 'likeIncludes accent-insensitive');

  // Default deny 501
  {
    const res = await call('GET', '/api/v1/does-not-exist');
    assert(res.status === 501, 'unhandled → 501');
    assert(String(res.data?.retMsg || '').includes('Mock not implemented'), '501 message');
  }

  // Login fail → 401
  {
    const res = await call('POST', '/api/users/login', {
      data: { username: 'ttb', password: 'wrong' },
    });
    assert(res.status === 401, 'login wrong password → 401');
  }

  // Inactive account
  {
    const res = await call('POST', '/api/users/login', {
      data: { username: 'inactive', password: 'abc123456' },
    });
    assert(res.status === 401, 'inactive → 401');
  }

  // Login success all roles
  let userToken;
  let staffToken;
  let accountantToken;
  {
    const u = await call('POST', '/api/users/login', {
      data: { username: 'ttb', password: 'abc123456' },
    });
    assert(u.status === 200, 'USER login 200');
    assert(u.data?.data?.token?.split('.').length === 3, 'JWT 3 parts');
    assert(u.data?.data?.user?.role === 'USER', 'USER role');
    userToken = u.data.data.token;

    const s = await call('POST', '/api/users/login', {
      data: { username: 'ntminh', password: 'abc123456' },
    });
    assert(s.status === 200 && s.data.data.user.role === 'STAFF', 'STAFF login');
    staffToken = s.data.data.token;

    const a = await call('POST', '/api/users/login', {
      data: { username: 'nva', password: 'abc123456' },
    });
    assert(a.status === 200 && a.data.data.user.role === 'ACCOUNTANT', 'ACCOUNTANT login');
    accountantToken = a.data.data.token;
  }

  // Rooms public
  {
    const res = await call('GET', '/api/v1/rooms');
    assert(res.status === 200, 'rooms list 200');
    assert(res.data.data.length >= 25 && res.data.data.length <= 30, 'rooms catalog 25–30');
    assert(!res.data.data.some((r) => /mock wing/i.test(r.roomName || '')), 'no Mock Wing names');
    assert(res.data.data.every((r) => r.mainImage?.imageUrl || r.images?.[0]?.imageUrl), 'every room has image');
    const first = res.data.data[0];
    first.roomName = 'MUTATED';
    const res2 = await call('GET', '/api/v1/rooms');
    assert(res2.data.data[0].roomName !== 'MUTATED', 'deep clone protects store');
  }

  // Feedback list requires auth
  {
    const anon = await call('GET', '/api/v1/feedbacks');
    assert(anon.status === 403, 'feedbacks without token → 403');
    const ok = await call('GET', '/api/v1/feedbacks', { token: userToken });
    assert(ok.status === 200 && ok.data.data.length >= 5, 'feedbacks with USER');
  }

  // Hotel services role
  {
    const asUser = await call('GET', '/api/v1/hotel-services', { token: userToken });
    assert(asUser.status === 403, 'hotel-services USER → 403');
    const asStaff = await call('GET', '/api/v1/hotel-services', { token: staffToken });
    assert(asStaff.status === 200 && asStaff.data.data.length === 7, 'hotel-services STAFF');
    const asAcc = await call('GET', '/api/v1/hotel-services', { token: accountantToken });
    assert(asAcc.status === 200, 'hotel-services ACCOUNTANT');
  }

  // My bookings isolation
  {
    const mine = await call('GET', '/api/bookings/my', { token: userToken });
    assert(mine.status === 200, 'my bookings 200');
    assert(mine.data.data.every((b) => b.userId === 3), 'only ttb bookings');
    const staffMy = await call('GET', '/api/bookings/my', { token: staffToken });
    assert(staffMy.status === 403, 'STAFF cannot /my');
  }

  // Create booking (fullName lookup quirk)
  {
    const futureIn = new Date();
    futureIn.setDate(futureIn.getDate() + 30);
    const futureOut = new Date();
    futureOut.setDate(futureOut.getDate() + 32);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const res = await call('POST', '/api/bookings', {
      token: userToken,
      data: {
        fullName: 'Trần Thị Bình',
        roomNumber: '110',
        checkInDate: fmt(futureIn),
        checkOutDate: fmt(futureOut),
        bookingType: 'Day',
        status: 'Confirmed',
        note: 'mock test',
      },
    });
    assert(res.status === 201, 'create booking 201');
    assert(res.data.data.bookingId > 0, 'bookingId returned');
    const after = await call('GET', '/api/bookings/my', { token: userToken });
    assert(
      after.data.data.some((b) => b.id === res.data.data.bookingId),
      'new booking visible in /my'
    );
  }

  // Cancel idempotent fail
  {
    const mine = await call('GET', '/api/bookings/my', { token: userToken });
    const confirmed = mine.data.data.find((b) => String(b.status).toLowerCase() === 'confirmed');
    assert(!!confirmed, 'has confirmed booking');
    const c1 = await call('PUT', `/api/bookings/${confirmed.id}/cancel`, { token: userToken });
    assert(c1.status === 200, 'cancel once OK');
    const c2 = await call('PUT', `/api/bookings/${confirmed.id}/cancel`, { token: userToken });
    assert(c2.status === 400, 'cancel twice → 400');
  }

  // Profile isolation
  {
    const other = await call('GET', '/api/users/ntminh', { token: userToken });
    assert(other.status === 403, 'USER cannot view other profile');
    const self = await call('GET', '/api/users/ttb', { token: userToken });
    assert(self.status === 200, 'USER view self');
  }

  // Logout
  {
    const res = await call('POST', '/api/users/logout', { token: userToken });
    assert(res.status === 200, 'logout 200');
  }

  // Expired token rejected
  {
    const expired = createMockJwt('ttb', 'USER', -10);
    const res = await call('GET', '/api/bookings/my', { token: expired });
    assert(res.status === 403, 'expired token → 403 on protected');
  }

  console.log('\nAll mock self-tests passed.');
  console.log('Store rooms:', getStore().rooms.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
