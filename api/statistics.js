import { http } from './index';

// 获取指定月份累计度数和费用
export const getMonthlyStatistics = (month) => {
  return http({
    url: '/api/statistics/monthly',
    method: 'GET',
    data: { month }
  });
};

// 获取指定月份每日充电量统计
export const getDailyStatistics = (month) => {
  return http({
    url: '/api/statistics/daily',
    method: 'GET',
    data: { month }
  });
};

// 获取本月白班/夜班电量占比
export const getMonthlyShiftStatistics = (month) => {
  return http({
    url: '/api/statistics/monthly-shift',
    method: 'GET',
    data: { month }
  });
}; 