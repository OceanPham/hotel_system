import { deepClone } from './utils.js';

import usersJson from './data/users.json';
import roomsJson from './data/rooms.json';
import roomImagesJson from './data/roomImages.json';
import hotelServicesJson from './data/hotelServices.json';
import bookingsJson from './data/bookings.json';
import bookingServicesJson from './data/bookingServices.json';
import paymentInvoicesJson from './data/paymentInvoices.json';
import feedbacksJson from './data/feedbacks.json';
import roomsExtraJson from './fixtures/rooms-extra.json';
import roomImagesExtraJson from './fixtures/roomImages-extra.json';

function maxId(list) {
  return list.reduce((m, x) => Math.max(m, x.id || 0), 0);
}

/**
 * In-memory store: nạp JSON (seed + fixture), deep clone.
 * Reload trang → module reload → về gốc. Không persist nghiệp vụ.
 */
function createInitialStore() {
  return {
    users: deepClone(usersJson),
    rooms: deepClone([...roomsJson, ...roomsExtraJson]),
    roomImages: deepClone([...roomImagesJson, ...roomImagesExtraJson]),
    hotelServices: deepClone(hotelServicesJson),
    bookings: deepClone(bookingsJson),
    bookingServices: deepClone(bookingServicesJson),
    paymentInvoices: deepClone(paymentInvoicesJson),
    feedbacks: deepClone(feedbacksJson),
    /** Upload / object URL trong phiên */
    sessionUploads: [],
    nextIds: {
      user: maxId(usersJson) + 1,
      room: Math.max(maxId(roomsJson), maxId(roomsExtraJson)) + 1,
      roomImage: Math.max(maxId(roomImagesJson), maxId(roomImagesExtraJson)) + 1,
      hotelService: maxId(hotelServicesJson) + 1,
      booking: maxId(bookingsJson) + 1,
      bookingService: maxId(bookingServicesJson) + 1,
      paymentInvoice: maxId(paymentInvoicesJson) + 1,
      feedback: maxId(feedbacksJson) + 1,
    },
  };
}

let store = createInitialStore();

export function getStore() {
  return store;
}

export function resetStore() {
  store = createInitialStore();
  return store;
}

export function nextId(entity) {
  const id = store.nextIds[entity];
  store.nextIds[entity] = id + 1;
  return id;
}
