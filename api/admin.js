import { http } from './index';

/**
 * 获取所有用户列表
 * @returns {Promise<Array>} 用户列表
 */
export const getAllUsers = () => {
  return http({
    url: '/api/admin/users',
    method: 'GET',
  });
};

/**
 * 修改用户预约权限状态
 * @param {string|number} userId - 用户ID
 * @param {boolean} canReserve - 是否允许预约
 * @returns {Promise<Object>} 更新结果
 */
export const updateUserReserve = (userId, canReserve) => {
  return http({
    url: '/api/admin/user/can_reserve',
    method: 'POST',
    data: { user_id: userId, can_reserve: canReserve },
  });
};

/**
 * 修改用户电价
 * @param {string|number} userId - 用户ID
 * @param {number} unitPrice - 单价（分/kWh）
 * @returns {Promise<Object>} 更新结果
 */
export const updateUserPrice = (userId, unitPrice) => {
  return http({
    url: '/api/admin/user/unit_price',
    method: 'POST',
    data: { user_id: userId, unit_price: unitPrice },
  });
};

/**
 * 获取月度对账数据
 * @param {string} month - 月份，格式：YYYY-MM
 * @returns {Promise<Object>} 月度对账数据
 */
export const getMonthlyReport = (month) => {
  return http({
    url: '/api/admin/monthly_report',
    method: 'GET',
    data: { month },
  });
};
