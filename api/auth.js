import { http } from './index';

// 微信登录
export const wxLogin = (data) => {
  return http({
    url: '/api/auth/login',
    method: 'POST',
    data,
  });
};

// 获取用户信息
export const getUserProfile = () => {
  return http({
    url: '/api/users/profile',
    method: 'GET',
  });
};

// 退出登录
export const logout = () => {
  return http({
    url: '/api/auth/logout',
    method: 'POST',
  });
};

// 获取用户电价
export const getUserPrice = () => {
  return http({
    url: '/api/users/price',
    method: 'GET',
  });
};
