import { handleUsers } from './users.js';
import { handleRooms } from './rooms.js';
import { handleBookings } from './bookings.js';
import { handleFeedbacks } from './feedbacks.js';
import { handleHotelServices } from './hotelServices.js';
import { resultDataMsg } from '../utils.js';

/**
 * Router mock — default-deny 501 nếu không có handler.
 * Marker chuỗi cho tree-shake check: MOCK_UNHANDLED_501
 */
export async function routeMockRequest({ method, pathname, body, config, query }) {
  const handlers = [
    handleUsers,
    handleRooms,
    handleBookings,
    handleFeedbacks,
    handleHotelServices,
  ];

  for (const handler of handlers) {
    const result = handler(method, pathname, { body, config, query });
    if (result) return result;
  }

  const label = `${method} ${pathname}`;
  console.error(`[MOCK_UNHANDLED_501] No mock handler for ${label}`);
  return {
    status: 501,
    data: resultDataMsg('FAIL', `Mock not implemented: ${label}`, null),
  };
}
