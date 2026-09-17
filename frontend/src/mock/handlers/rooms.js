import { getStore, nextId } from '../store.js';
import { getAuthUser } from '../auth.js';
import { deepClone, likeIncludes, resultData, resultOnly } from '../utils.js';

function imagesForRoom(store, roomId) {
  return store.roomImages
    .filter((img) => img.roomId === roomId)
    .map((img) => ({
      id: img.id,
      roomId: img.roomId,
      imageUrl: img.imageUrl,
      isMain: img.isMain,
    }));
}

function toRoomResp(store, room) {
  const images = imagesForRoom(store, room.id);
  const mainImage = images.find((i) => i.isMain === true) || null;
  return {
    id: room.id,
    roomName: room.roomName,
    roomNumber: room.roomNumber,
    roomType: room.roomType,
    basePrice: room.basePrice,
    status: room.status,
    description: room.description,
    images,
    mainImage,
  };
}

/**
 * Mirror RoomMapper.listRooms — filter theo criteria, KHÔNG phân trang
 * (SQL không có LIMIT dù RoomCriteria extends Page).
 */
function filterRooms(store, query) {
  let list = store.rooms.slice();
  if (query.roomName) list = list.filter((r) => likeIncludes(r.roomName, query.roomName));
  if (query.roomNumber) list = list.filter((r) => likeIncludes(r.roomNumber, query.roomNumber));
  if (query.roomType) list = list.filter((r) => r.roomType === query.roomType);
  if (query.status) list = list.filter((r) => r.status === query.status);
  list.sort((a, b) => String(a.roomNumber).localeCompare(String(b.roomNumber)));
  return list;
}

export function handleRooms(method, pathname, { body, config, query }) {
  const store = getStore();
  const auth = getAuthUser(config, store);

  if (method === 'GET' && pathname === '/api/v1/rooms') {
    const list = filterRooms(store, query).map((r) => toRoomResp(store, r));
    return { status: 200, data: resultData('Success', deepClone(list), list.length) };
  }

  if (method === 'GET' && pathname === '/api/v1/rooms/search') {
    const list = filterRooms(store, query).map((r) => toRoomResp(store, r));
    return { status: 200, data: resultData('Success', deepClone(list), list.length) };
  }

  const idMatch = pathname.match(/^\/api\/v1\/rooms\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    const id = Number(idMatch[1]);
    const room = store.rooms.find((r) => r.id === id);
    if (!room) return { status: 200, data: resultData('Error', null) };
    return { status: 200, data: resultData('Success', deepClone(toRoomResp(store, room))) };
  }

  if (method === 'POST' && pathname === '/api/v1/rooms') {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    if (store.rooms.some((r) => r.roomNumber === body?.roomNumber)) {
      return { status: 200, data: resultOnly('Error', 'Room number already exists.') };
    }
    const room = {
      id: nextId('room'),
      roomName: body.roomName,
      roomNumber: body.roomNumber,
      roomType: body.roomType,
      basePrice: body.basePrice,
      status: 'Vacant',
      description: body.description || '',
    };
    store.rooms.push(room);
    if (Array.isArray(body.images)) {
      for (const img of body.images) {
        store.roomImages.push({
          id: nextId('roomImage'),
          roomId: room.id,
          imageUrl: img.imageUrl,
          isMain: !!img.isMain,
        });
      }
    }
    return { status: 200, data: resultOnly('Success', 'Room created with image URLs.') };
  }

  if (method === 'PUT' && idMatch) {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(idMatch[1]);
    const room = store.rooms.find((r) => r.id === id);
    if (!room) return { status: 200, data: resultOnly('Error', 'Room not found or update failed.') };
    Object.assign(room, {
      roomName: body.roomName ?? room.roomName,
      roomNumber: body.roomNumber ?? room.roomNumber,
      roomType: body.roomType ?? room.roomType,
      basePrice: body.basePrice ?? room.basePrice,
      status: body.status ?? room.status,
      description: body.description ?? room.description,
    });
    if (Array.isArray(body.images)) {
      store.roomImages = store.roomImages.filter((i) => i.roomId !== id);
      for (const img of body.images) {
        store.roomImages.push({
          id: nextId('roomImage'),
          roomId: id,
          imageUrl: img.imageUrl,
          isMain: !!img.isMain,
        });
      }
    }
    return { status: 200, data: resultOnly('Success', 'Room updated with image URLs.') };
  }

  const deact = pathname.match(/^\/api\/v1\/rooms\/(\d+)\/deactivate$/);
  if (method === 'PUT' && deact) {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(deact[1]);
    const room = store.rooms.find((r) => r.id === id);
    if (!room || room.status === 'Inactive') {
      return { status: 200, data: resultOnly('Error', 'Room not found or already inactive.') };
    }
    room.status = 'Inactive';
    return { status: 200, data: resultOnly('Success', 'Room marked as inactive.') };
  }

  if (method === 'DELETE' && idMatch) {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(idMatch[1]);
    const idx = store.rooms.findIndex((r) => r.id === id);
    if (idx < 0) {
      return { status: 200, data: resultOnly('Error', 'Room not found or delete failed.') };
    }
    store.rooms.splice(idx, 1);
    store.roomImages = store.roomImages.filter((i) => i.roomId !== id);
    return { status: 200, data: resultOnly('Success', 'Room deleted successfully.') };
  }

  return null;
}
