import { getStore, nextId } from '../store.js';
import { getAuthUser } from '../auth.js';
import { deepClone, resultData, resultOnly } from '../utils.js';

function toFeedbackResp(store, fb) {
  const booking = store.bookings.find((b) => b.id === fb.bookingId);
  const user = store.users.find((u) => u.id === fb.userId);
  const room = booking ? store.rooms.find((r) => r.id === booking.roomId) : null;
  return {
    id: fb.id,
    userName: user?.fullName || user?.username || null,
    roomNumber: room?.roomNumber || null,
    rating: fb.rating,
    comment: fb.comment,
    createdAt: fb.createdAt,
  };
}

export function handleFeedbacks(method, pathname, { body, config, query }) {
  const store = getStore();
  const auth = getAuthUser(config, store);

  if (method === 'GET' && pathname === '/api/v1/feedbacks') {
    if (!auth || !['USER', 'STAFF', 'ACCOUNTANT'].includes(auth.role)) {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const list = store.feedbacks.map((fb) => toFeedbackResp(store, fb));
    return { status: 200, data: resultData('Success', deepClone(list), list.length) };
  }

  const roomMatch = pathname.match(/^\/api\/v1\/feedbacks\/room\/(\d+)$/);
  if (method === 'GET' && roomMatch) {
    const roomId = Number(roomMatch[1]);
    const list = store.feedbacks
      .filter((fb) => {
        const b = store.bookings.find((x) => x.id === fb.bookingId);
        return b && b.roomId === roomId;
      })
      .map((fb) => toFeedbackResp(store, fb));
    return { status: 200, data: resultData('Success', deepClone(list), list.length) };
  }

  const avgMatch = pathname.match(/^\/api\/v1\/feedbacks\/room\/(\d+)\/average-rating$/);
  if (method === 'GET' && avgMatch) {
    const roomId = Number(avgMatch[1]);
    const ratings = store.feedbacks
      .filter((fb) => {
        const b = store.bookings.find((x) => x.id === fb.bookingId);
        return b && b.roomId === roomId;
      })
      .map((fb) => fb.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0.0;
    return { status: 200, data: resultData('Success', avg, 1) };
  }

  const bookingFb = pathname.match(/^\/api\/v1\/feedbacks\/booking\/(\d+)$/);
  if (method === 'GET' && bookingFb) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const bookingId = Number(bookingFb[1]);
    const fb = store.feedbacks.find(
      (f) => f.bookingId === bookingId && f.userId === auth.user.id
    );
    if (!fb) {
      return { status: 200, data: resultData('No feedback found', null, 0) };
    }
    return {
      status: 200,
      data: resultData('Success', deepClone(toFeedbackResp(store, fb)), 1),
    };
  }

  if (method === 'POST' && pathname === '/api/v1/feedbacks') {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const booking = store.bookings.find((b) => b.id === body?.bookingId);
    if (!booking || booking.userId !== auth.user.id) {
      return {
        status: 200,
        data: resultOnly('Error', 'You are not allowed to give feedback for this booking.'),
      };
    }
    store.feedbacks.push({
      id: nextId('feedback'),
      userId: auth.user.id,
      bookingId: body.bookingId,
      rating: body.rating,
      comment: body.comment || '',
      createdAt: new Date().toISOString().slice(0, 19),
    });
    return { status: 200, data: resultOnly('Success', 'Feedback submitted.') };
  }

  const idMatch = pathname.match(/^\/api\/v1\/feedbacks\/(\d+)$/);
  if (method === 'PUT' && idMatch) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(idMatch[1]);
    const fb = store.feedbacks.find((f) => f.id === id);
    if (!fb || fb.userId !== auth.user.id) {
      return {
        status: 200,
        data: resultOnly('Error', 'You are not authorized to update this feedback.'),
      };
    }
    fb.rating = body.rating ?? fb.rating;
    fb.comment = body.comment ?? fb.comment;
    return { status: 200, data: resultOnly('Success', 'Feedback updated successfully.') };
  }

  if (method === 'DELETE' && idMatch) {
    if (!auth || auth.role !== 'USER') {
      return { status: 403, data: resultOnly('Error', 'Access Denied') };
    }
    const id = Number(idMatch[1]);
    const fb = store.feedbacks.find((f) => f.id === id);
    if (!fb || fb.userId !== auth.user.id) {
      return {
        status: 200,
        data: resultOnly('Error', 'You are not authorized to delete this feedback.'),
      };
    }
    store.feedbacks = store.feedbacks.filter((f) => f.id !== id);
    return { status: 200, data: resultOnly('Success', 'Feedback deleted successfully.') };
  }

  return null;
}
