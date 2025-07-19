import { http } from './index';

// 微信登录
export const wxLogin = (data) => {
  return http({
    url: '/auth/login',
    method: 'POST',
    data
  });
};

// 获取用户信息
export const getUserProfile = () => {
  return http({
    url: '/users/profile',
    method: 'GET'
  });
};

// 退出登录
export const logout = () => {
  return http({
    url: '/auth/logout',
    method: 'POST'
  });
};

// 获取用户电价
export const getUserPrice = () => {
  return http({
    url: '/users/price',
    method: 'GET'
  });
}; 