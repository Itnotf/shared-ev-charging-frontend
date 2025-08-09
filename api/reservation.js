import { http } from './index';

// 获取预约列表
export const getReservations = (date) => {
  return http({
    url: '/api/reservations',
    method: 'GET',
    data: date ? { date } : {},
  });
};

// 创建预约
export const createReservation = (data) => {
  return http({
    url: '/api/reservations',
    method: 'POST',
    data,
  });
};

// 取消预约
export const cancelReservation = (id) => {
  return http({
    url: `/api/reservations/${id}`,
    method: 'DELETE',
  });
};

// 获取当前预约状态
export const getCurrentReservationStatus = () => {
  return http({
    url: '/api/reservations/current-status',
    method: 'GET',
  });
};
