import axiosClient from './axiosClient';
export { roomApi } from './roomApi';

export const serviceApi = {
  getAllServices: () => axiosClient.get('/api/v1/hotel-services'),
};

export const feedbackApi = {
  getFeedbacksByRoom: (roomId) => axiosClient.get(`/api/v1/feedbacks/room/${roomId}`),
  getAllFeedbacks: () => axiosClient.get('/api/v1/feedbacks'),
};

export const authApi = {
  login: (credentials) => axiosClient.post('/api/users/login', credentials),
  register: (userData) => axiosClient.post('/api/users', userData),
  changePassword: (username, data) => axiosClient.post(`/api/users/${username}/change-password`, data),
  getProfile: (username) => axiosClient.get(`/api/users/${username}`),
};

export const bookingApi = {
  createBooking: (bookingData) => axiosClient.post('/api/bookings', bookingData),
  getMyBookings: () => axiosClient.get('/api/bookings/my'),
  getBookingById: (id) => axiosClient.get(`/api/bookings/${id}`),
};
