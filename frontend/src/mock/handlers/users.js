import { getStore, nextId } from '../store.js';
import { createMockJwt, getAuthUser } from '../auth.js';
import { deepClone, likeIncludes, resultData, resultDataMsg } from '../utils.js';

function toUserResp(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    password: user.password,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    nationality: user.nationality,
    role: user.role,
    status: user.status,
  };
}

function requireRoles(auth, roles) {
  if (!auth) {
    return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
  }
  if (roles && !roles.includes(auth.role)) {
    return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
  }
  return null;
}

export function handleUsers(method, pathname, { body, config, query }) {
  const store = getStore();
  const auth = getAuthUser(config, store);

  // POST /api/users/login
  if (method === 'POST' && pathname === '/api/users/login') {
    const username = body?.username;
    const password = body?.password;
    const user = store.users.find((u) => u.username === username);
    if (!user || user.passwordPlain !== password) {
      return {
        status: 401,
        data: resultDataMsg('FAIL', 'Invalid username or password', null),
      };
    }
    if (String(user.status).toLowerCase() !== 'active') {
      return {
        status: 401,
        data: resultDataMsg('FAIL', 'Account is not active', null),
      };
    }
    const token = createMockJwt(user.username, user.role);
    return {
      status: 200,
      data: resultData('SUCCESS', { token, user: toUserResp(user) }, 1),
    };
  }

  // POST /api/users/logout
  if (method === 'POST' && pathname === '/api/users/logout') {
    return {
      status: 200,
      data: resultDataMsg('SUCCESS', 'Logged out successfully', null),
    };
  }

  // POST /api/users — register
  if (method === 'POST' && pathname === '/api/users') {
    try {
      if (store.users.some((u) => u.username === body?.username)) {
        return {
          status: 400,
          data: resultDataMsg('FAIL', 'Username already exists', null),
        };
      }
      const user = {
        id: nextId('user'),
        username: body.username,
        passwordPlain: body.password,
        password: '$2a$10$mockhash' + Date.now(),
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        gender: body.gender || 'Nam',
        nationality: body.nationality || 'Vietnam',
        role: body.role || 'USER',
        status: body.status || 'Active',
      };
      store.users.push(user);
      return {
        status: 201,
        data: resultDataMsg('SUCCESS', 'User created successfully', null),
      };
    } catch (e) {
      return {
        status: 400,
        data: resultDataMsg('FAIL', e.message, null),
      };
    }
  }

  // GET /api/users?userIds=
  if (method === 'GET' && pathname === '/api/users' && query.userIds != null) {
    const ids = (Array.isArray(query.userIds) ? query.userIds : String(query.userIds).split(','))
      .map(Number)
      .filter(Boolean);
    const list = store.users.filter((u) => ids.includes(u.id)).map(toUserResp);
    return { status: 200, data: resultData('SUCCESS', deepClone(list), list.length) };
  }

  // GET /api/users
  if (method === 'GET' && pathname === '/api/users') {
    const denied = requireRoles(auth, ['STAFF']);
    if (denied) return denied;
    const list = store.users.map(toUserResp);
    return { status: 200, data: resultData('SUCCESS', deepClone(list), list.length) };
  }

  // GET /api/users/search
  if (method === 'GET' && pathname === '/api/users/search') {
    let list = store.users.slice();
    if (query.fullName) list = list.filter((u) => likeIncludes(u.fullName, query.fullName));
    if (query.username) list = list.filter((u) => likeIncludes(u.username, query.username));
    if (query.email) list = list.filter((u) => likeIncludes(u.email, query.email));
    if (query.phone) list = list.filter((u) => likeIncludes(u.phone, query.phone));
    if (query.roles) {
      const roles = (Array.isArray(query.roles) ? query.roles : [query.roles]).map(String);
      list = list.filter((u) => roles.includes(u.role));
    }
    if (query.statuses) {
      const statuses = (Array.isArray(query.statuses) ? query.statuses : [query.statuses]).map(String);
      list = list.filter((u) => statuses.includes(u.status));
    }
    const resp = list.map(toUserResp);
    return { status: 200, data: resultData('SUCCESS', deepClone(resp), resp.length) };
  }

  // POST /api/users/:username/change-password
  const changeMatch = pathname.match(/^\/api\/users\/([^/]+)\/change-password$/);
  if (method === 'POST' && changeMatch) {
    const username = decodeURIComponent(changeMatch[1]);
    if (!auth || auth.user.username !== username) {
      return {
        status: 403,
        data: resultDataMsg('FAIL', 'You can only change your own password', null),
      };
    }
    const user = store.users.find((u) => u.username === username);
    if (!user || user.passwordPlain !== body?.oldPassword) {
      return {
        status: 401,
        data: resultDataMsg('FAIL', 'Old password is incorrect', null),
      };
    }
    user.passwordPlain = body.newPassword;
    user.password = '$2a$10$mockhash' + Date.now();
    return {
      status: 200,
      data: resultDataMsg('SUCCESS', 'Password changed successfully', null),
    };
  }

  // PUT /api/users/:username
  const putMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (method === 'PUT' && putMatch) {
    const username = decodeURIComponent(putMatch[1]);
    const denied = requireRoles(auth, ['USER', 'STAFF']);
    if (denied) return denied;
    if (auth.user.username !== username) {
      return {
        status: 403,
        data: resultDataMsg('FAIL', 'You are only allowed to update your own profile', null),
      };
    }
    const existing = store.users.find((u) => u.username === username);
    if (!existing) {
      return { status: 404, data: resultDataMsg('FAIL', 'User not found', null) };
    }
    existing.fullName = body.fullName ?? existing.fullName;
    existing.phone = body.phone ?? existing.phone;
    existing.email = body.email ?? existing.email;
    existing.gender = body.gender ?? existing.gender;
    existing.nationality = body.nationality ?? existing.nationality;
    return {
      status: 200,
      data: resultDataMsg('SUCCESS', 'User updated successfully', null),
    };
  }

  // GET /api/users/:username
  const getMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (method === 'GET' && getMatch) {
    const username = decodeURIComponent(getMatch[1]);
    const denied = requireRoles(auth, ['USER', 'STAFF', 'ACCOUNTANT']);
    if (denied) return denied;
    if (auth.role === 'USER' && auth.user.username !== username) {
      return {
        status: 403,
        data: resultDataMsg('FAIL', 'You can only view your own profile', null),
      };
    }
    const user = store.users.find((u) => u.username === username);
    if (!user) {
      return { status: 404, data: resultData('FAIL', null) };
    }
    return { status: 200, data: resultData('SUCCESS', deepClone(toUserResp(user)), 1) };
  }

  return null;
}
