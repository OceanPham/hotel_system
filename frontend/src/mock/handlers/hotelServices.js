import { getStore, nextId } from '../store.js';
import { getAuthUser } from '../auth.js';
import { deepClone, likeIncludes, resultData, resultOnly } from '../utils.js';

function toResp(svc) {
  return {
    id: svc.id,
    name: svc.name,
    price: svc.price,
    description: svc.description,
    imageUrl: svc.imageUrl,
  };
}

export function handleHotelServices(method, pathname, { body, config, query }) {
  const store = getStore();
  const auth = getAuthUser(config, store);

  if (method === 'GET' && pathname === '/api/v1/hotel-services') {
    if (!auth || !['STAFF', 'ACCOUNTANT'].includes(auth.role)) {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    let list = store.hotelServices.slice();
    if (query.name) list = list.filter((s) => likeIncludes(s.name, query.name));
    const resp = list.map(toResp);
    return { status: 200, data: resultData('Success', deepClone(resp), resp.length) };
  }

  const idMatch = pathname.match(/^\/api\/v1\/hotel-services\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    if (!auth || !['STAFF', 'ACCOUNTANT'].includes(auth.role)) {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const svc = store.hotelServices.find((s) => s.id === Number(idMatch[1]));
    if (!svc) return { status: 200, data: resultData('Error', null) };
    return { status: 200, data: resultData('Success', deepClone(toResp(svc))) };
  }

  if (method === 'POST' && pathname === '/api/v1/hotel-services') {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    if (store.hotelServices.some((s) => s.name === body?.name)) {
      return { status: 200, data: resultOnly('Error', 'Service name already exists') };
    }
    store.hotelServices.push({
      id: nextId('hotelService'),
      name: body.name,
      price: body.price,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
    });
    return { status: 200, data: resultOnly('Success', 'Service created successfully.') };
  }

  if (method === 'PUT' && idMatch) {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const svc = store.hotelServices.find((s) => s.id === Number(idMatch[1]));
    if (!svc) {
      return { status: 200, data: resultOnly('Error', 'Service not found or update failed.') };
    }
    Object.assign(svc, {
      name: body.name ?? svc.name,
      price: body.price ?? svc.price,
      description: body.description ?? svc.description,
      imageUrl: body.imageUrl ?? svc.imageUrl,
    });
    return { status: 200, data: resultOnly('Success', 'Service updated successfully.') };
  }

  if (method === 'DELETE' && idMatch) {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(idMatch[1]);
    const before = store.hotelServices.length;
    store.hotelServices = store.hotelServices.filter((s) => s.id !== id);
    if (store.hotelServices.length === before) {
      return { status: 200, data: resultOnly('Error', 'Service not found or delete failed.') };
    }
    return { status: 200, data: resultOnly('Success', 'Service deleted successfully.') };
  }

  return null;
}
