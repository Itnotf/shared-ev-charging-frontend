import { http } from './index';

// 获取充电记录列表
export const getRecords = (date) => {
  return http({
    url: '/records',
    method: 'GET',
    data: date ? { date } : {}
  });
};

// 创建充电记录
export const createRecord = (data) => {
  return http({
    url: '/records',
    method: 'POST',
    data
  });
};

// 获取未提交的充电记录
export const getUnsubmittedRecord = () => {
  return http({
    url: '/records/unsubmitted',
    method: 'GET'
  });
}; 