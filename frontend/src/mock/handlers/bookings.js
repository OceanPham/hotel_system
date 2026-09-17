import { getStore, nextId } from '../store.js';
import { getAuthUser } from '../auth.js';
import { deepClone, likeIncludes, resultData, resultDataMsg } from '../utils.js';

function enrichBooking(store, booking) {
  const user = store.users.find((u) => u.id === booking.userId);
  const room = store.rooms.find((r) => r.id === booking.roomId);
  const invoice = store.paymentInvoices.find((p) => p.bookingId === booking.id);
  const mainImg = store.roomImages.find((i) => i.roomId === booking.roomId && i.isMain);
  return {
    id: booking.id,
    userId: booking.userId,
    roomId: booking.roomId,
    userName: user?.username ?? null,
    fullName: user?.fullName ?? null,
    phone: user?.phone ?? null,
    email: user?.email ?? null,
    roomNumber: room?.roomNumber ?? null,
    roomName: room?.roomName ?? null,
    roomType: room?.roomType ?? null,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    status: booking.status,
    bookingType: booking.bookingType,
    note: booking.note,
    createdAt: booking.createdAt,
    totalAmount: invoice?.totalAmount ?? null,
    mainImageUrl: mainImg?.imageUrl ?? null,
  };
}

function datesOverlap(aIn, aOut, bIn, bOut) {
  const A1 = new Date(aIn);
  const A2 = new Date(aOut);
  const B1 = new Date(bIn);
  const B2 = new Date(bOut);
  return A1 < B2 && B1 < A2;
}

function validateBookingDates(store, roomNumber, checkInDate, checkOutDate, excludeId) {
  if (!checkInDate || !checkOutDate) {
    throw new Error('Check-in and check-out dates must not be null');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cin = new Date(checkInDate);
  const cout = new Date(checkOutDate);
  if (cin < today) {
    throw new Error('Check-in date must not be in the past');
  }
  if (cin > cout) {
    throw new Error('Check-in date must be before check-out date');
  }
  const room = store.rooms.find(
    (r) => String(r.roomNumber).toLowerCase() === String(roomNumber).toLowerCase()
  );
  if (!room) return;
  const overlapping = store.bookings.filter((b) => {
    if (excludeId && b.id === excludeId) return false;
    if (b.roomId !== room.id) return false;
    if (String(b.status).toLowerCase() === 'cancelled') return false;
    return datesOverlap(b.checkInDate, b.checkOutDate, checkInDate, checkOutDate);
  });
  if (overlapping.length > 0) {
    throw new Error('Room is already booked during the selected dates');
  }
}

/**
 * Quirk backend: createBooking lấy userId bằng fullName (equalsIgnoreCase),
 * KHÔNG lấy từ JWT hiện tại.
 */
export function handleBookings(method, pathname, { body, config, query }) {
  const store = getStore();
  const auth = getAuthUser(config, store);

  if (method === 'GET' && pathname === '/api/bookings') {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const list = store.bookings.map((b) => enrichBooking(store, b));
    return { status: 200, data: resultData('SUCCESS', deepClone(list), list.length) };
  }

  if (method === 'GET' && pathname === '/api/bookings/my') {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const list = store.bookings
      .filter((b) => b.userId === auth.user.id)
      .map((b) => enrichBooking(store, b));
    return { status: 200, data: resultData('SUCCESS', deepClone(list), list.length) };
  }

  if (method === 'GET' && pathname === '/api/bookings/search') {
    if (!auth || auth.role !== 'STAFF') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    let list = store.bookings.map((b) => enrichBooking(store, b));
    if (query.fullName) list = list.filter((b) => likeIncludes(b.fullName, query.fullName));
    if (query.roomNumber) list = list.filter((b) => likeIncludes(b.roomNumber, query.roomNumber));
    if (query.status) list = list.filter((b) => String(b.status).toLowerCase() === String(query.status).toLowerCase());
    if (query.bookingType) list = list.filter((b) => b.bookingType === query.bookingType);
    if (query.checkInDateFrom) list = list.filter((b) => b.checkInDate >= query.checkInDateFrom);
    if (query.checkInDateTo) list = list.filter((b) => b.checkInDate <= query.checkInDateTo);
    if (query.checkOutDateFrom) list = list.filter((b) => b.checkOutDate >= query.checkOutDateFrom);
    if (query.checkOutDateTo) list = list.filter((b) => b.checkOutDate <= query.checkOutDateTo);
    return { status: 200, data: resultData('SUCCESS', deepClone(list), list.length) };
  }

  const idMatch = pathname.match(/^\/api\/bookings\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    if (!auth || !['USER', 'STAFF'].includes(auth.role)) {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const id = Number(idMatch[1]);
    const booking = store.bookings.find((b) => b.id === id);
    if (!booking) {
      return {
        status: 404,
        data: resultDataMsg('FAIL', 'Booking not found', null),
      };
    }
    return {
      status: 200,
      data: resultData('SUCCESS', deepClone(enrichBooking(store, booking))),
    };
  }

  if (method === 'POST' && pathname === '/api/bookings') {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    try {
      const user = store.users.find(
        (u) => String(u.fullName).toLowerCase() === String(body.fullName || '').toLowerCase()
      );
      const room = store.rooms.find(
        (r) => String(r.roomNumber).toLowerCase() === String(body.roomNumber || '').toLowerCase()
      );
      if (!user || !room) {
        return { status: 400, data: resultData('FAIL', null) };
      }
      validateBookingDates(store, body.roomNumber, body.checkInDate, body.checkOutDate);
      const booking = {
        id: nextId('booking'),
        userId: user.id,
        roomId: room.id,
        checkInDate: body.checkInDate,
        checkOutDate: body.checkOutDate,
        status: body.status || 'Confirmed',
        bookingType: body.bookingType || 'Day',
        note: body.note || '',
        createdAt: new Date().toISOString().slice(0, 19),
      };
      store.bookings.push(booking);

      // Snapshot giá phòng vào invoice (không dùng giá client gửi)
      const nights = Math.max(
        1,
        Math.round(
          (new Date(body.checkOutDate) - new Date(body.checkInDate)) / (1000 * 60 * 60 * 24)
        )
      );
      const roomAmount = room.basePrice * nights;
      const tax = Math.round(roomAmount * 0.1);
      store.paymentInvoices.push({
        id: nextId('paymentInvoice'),
        bookingId: booking.id,
        createdAt: new Date().toISOString().slice(0, 19),
        roomAmount,
        serviceAmount: 0,
        tax,
        totalAmount: roomAmount + tax,
        paymentMethod: 'Tiền mặt',
        status: 'Unpaid',
      });

      return {
        status: 201,
        data: resultDataMsg('SUCCESS', 'Booking created successfully', {
          bookingId: booking.id,
          userId: user.id,
          roomId: room.id,
        }),
      };
    } catch (e) {
      return { status: 400, data: resultData(e.message, null) };
    }
  }

  if (method === 'PUT' && idMatch) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const id = Number(idMatch[1]);
    const existing = store.bookings.find((b) => b.id === id);
    if (!existing) return { status: 404, data: resultData('FAIL', null) };
    if (existing.userId !== auth.user.id) {
      return { status: 403, data: resultData('FAIL', null) };
    }
    const room = store.rooms.find(
      (r) => String(r.roomNumber).toLowerCase() === String(body.roomNumber || '').toLowerCase()
    );
    if (!room) return { status: 400, data: resultData('FAIL', null) };
    try {
      validateBookingDates(store, body.roomNumber, body.checkInDate, body.checkOutDate, id);
      existing.roomId = room.id;
      existing.checkInDate = body.checkInDate;
      existing.checkOutDate = body.checkOutDate;
      existing.status = body.status ?? existing.status;
      existing.bookingType = body.bookingType ?? existing.bookingType;
      existing.note = body.note ?? existing.note;
      return { status: 200, data: resultData('SUCCESS', null) };
    } catch (e) {
      return { status: 400, data: resultData(e.message, null) };
    }
  }

  if (method === 'DELETE' && idMatch) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const id = Number(idMatch[1]);
    const existing = store.bookings.find((b) => b.id === id);
    if (!existing) return { status: 404, data: resultData('FAIL', null) };
    if (existing.userId !== auth.user.id) {
      return { status: 403, data: resultData('FAIL', null) };
    }
    store.bookings = store.bookings.filter((b) => b.id !== id);
    store.bookingServices = store.bookingServices.filter((s) => s.bookingId !== id);
    store.paymentInvoices = store.paymentInvoices.filter((p) => p.bookingId !== id);
    store.feedbacks = store.feedbacks.filter((f) => f.bookingId !== id);
    return { status: 200, data: resultData('SUCCESS', null) };
  }

  const cancelMatch = pathname.match(/^\/api\/bookings\/(\d+)\/cancel$/);
  if (method === 'PUT' && cancelMatch) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultDataMsg('FAIL', 'Access Denied', null) };
    }
    const id = Number(cancelMatch[1]);
    const booking = store.bookings.find((b) => b.id === id);
    if (!booking) {
      return { status: 404, data: resultDataMsg('FAIL', 'Booking not found', null) };
    }
    if (booking.userId !== auth.user.id) {
      return { status: 403, data: resultDataMsg('FAIL', 'Access denied', null) };
    }
    // Mirror: chỉ confirmed mới cancel; lần 2 → BAD_REQUEST (idempotent fail)
    if (String(booking.status).toLowerCase() !== 'confirmed') {
      return {
        status: 400,
        data: resultDataMsg('FAIL', 'Only confirmed bookings can be cancelled', null),
      };
    }
    booking.status = 'Cancelled';
    return {
      status: 200,
      data: resultDataMsg('SUCCESS', 'Booking cancelled successfully', null),
    };
  }

  return null;
}
