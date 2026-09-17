import axiosClient from './axiosClient';

export const roomApi = {
  getAllRooms: () => axiosClient.get('/api/v1/rooms'),
  getRoomById: (id) => axiosClient.get(`/api/v1/rooms/${id}`),
};

export default roomApi;
