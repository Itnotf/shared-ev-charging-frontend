import { http } from './index';

// 获取充电记录列表
export const getRecords = (date) => {
  return http({
    url: '/api/records',
    method: 'GET',
    data: date ? { date } : {},
  });
};

// 创建充电记录
export const createRecord = (data) => {
  return http({
    url: '/api/records',
    method: 'POST',
    data,
  });
};

// 获取未提交的充电记录
export const getUnsubmittedRecord = () => {
  return http({
    url: '/api/records/unsubmitted',
    method: 'GET',
  });
};

// 获取充电记录列表
export const getRecordsList = (month) => {
  return http({
    url: '/api/records/list',
    method: 'GET',
    data: { month },
  });
};

// 获取充电记录详情
export const getRecordDetail = (id) => {
  return http({
    url: `/api/records/${id}`,
    method: 'GET',
  });
};

// 更新充电记录
export const updateRecord = (id, data) => {
  return http({
    url: `/api/records/${id}`,
    method: 'PUT',
    data,
  });
};
