import { http } from './index';

// 车牌号验证函数
export const validateLicensePlate = (plateNumber) => {
  if (!plateNumber || typeof plateNumber !== 'string') {
    return false;
  }
  
  // 去除空格
  const plate = plateNumber.trim().toUpperCase();
  
  // 中国车牌号格式验证
  // 普通车牌：省份简称 + 字母 + 5位字母数字组合
  // 新能源车牌：省份简称 + 字母 + 6位字母数字组合
  const pattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}$/;
  
  return pattern.test(plate);
};

// 获取用户车牌号列表
export const getLicensePlates = () => {
  return http({
    url: '/api/license-plates',
    method: 'GET',
  });
};

// 添加车牌号
export const addLicensePlate = (data) => {
  return http({
    url: '/api/license-plates',
    method: 'POST',
    data,
  });
};

// 删除车牌号
export const deleteLicensePlate = (id) => {
  return http({
    url: `/api/license-plates/${id}`,
    method: 'DELETE',
  });
};

// 设置默认车牌号
export const setDefaultLicensePlate = (id) => {
  return http({
    url: `/api/license-plates/${id}/default`,
    method: 'PUT',
  });
};

// 更新车牌号
export const updateLicensePlate = (id, data) => {
  return http({
    url: `/api/license-plates/${id}`,
    method: 'PUT',
    data,
  });
};
