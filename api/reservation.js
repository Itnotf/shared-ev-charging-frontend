import { http } from './index';

// 获取预约列表
export const getReservations = (date) => {
  return http({
    url: '/reservations',
    method: 'GET',
    data: date ? { date } : {}
  });
};

// 创建预约
export const createReservation = (data) => {
  return http({
    url: '/reservations',
    method: 'POST',
    data
  });
};

// 取消预约
export const cancelReservation = (id) => {
  return http({
    url: `/reservations/${id}`,
    method: 'DELETE'
  });
};

// 获取当前预约状态
export const getCurrentReservationStatus = () => {
  return http({
    url: '/reservations/current-status',
    method: 'GET'
  });
}; 