import { baseUrl } from '@/config';
import { userAuth } from '@/utils';

// 刷新Token的Promise
let refreshTokenPromise = null;

// 请求拦截器
const httpInterceptor = {
  invoke(options) {
    // 1. 拼接请求地址
    options.url = baseUrl + options.url;

    // 2. 请求头
    options.header = {
      ...options.header,
      'Content-Type': 'application/json',
    };

    // 3. 添加token
    const token = uni.getStorageSync('token');
    if (token) {
      options.header.Authorization = `Bearer ${token}`;
    }

    // 4. 超时时间
    options.timeout = 10000;
  },
};

// 注册拦截器
uni.addInterceptor('request', httpInterceptor);
uni.addInterceptor('uploadFile', httpInterceptor);

// 创建API调用实例
export const createApi = (module) => {
  return (options) => {
    // 如果提供了模块名，则添加到URL前缀
    if (module) {
      options.url = `/${module}${options.url}`;
    }

    return http(options);
  };
};

// 刷新Token
const refreshAuthToken = async () => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        const res = await uni.request({
          url: '/api/auth/refresh', // 只传相对路径，由拦截器统一拼接 baseUrl
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${uni.getStorageSync('token')}`,
          },
        });

        if (res.statusCode === 200 && res.data.token) {
          // 更新存储的token
          uni.setStorageSync('token', res.data.token);
          resolve(res.data.token);
        } else {
          // 刷新失败，清除用户信息并跳转到登录页
          userAuth.clear();
          reject(new Error('Token刷新失败'));
          uni.navigateTo({ url: '/pages/login/login' });
        }
      } catch (error) {
        userAuth.clear();
        reject(error);
        uni.navigateTo({ url: '/pages/login/login' });
      } finally {
        refreshTokenPromise = null;
      }
    });
  }

  return refreshTokenPromise;
};

// 封装请求方法
export const http = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: async (res) => {
        // 状态码2xx表示成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 401未授权（未登录或token过期）
          try {
            // 尝试刷新Token
            const newToken = await refreshAuthToken();

            // 使用新token重新发起请求
            const newOptions = {
              ...options,
              header: {
                ...options.header,
                Authorization: `Bearer ${newToken}`,
              },
            };

            // 重新发起请求
            const retryRes = await http(newOptions);
            resolve(retryRes);
          } catch (error) {
            userAuth.clear();
            uni.navigateTo({ url: '/pages/login/login' });
            reject(error);
          }
        } else {
          // 其他错误
          // 不再弹窗，直接 reject
          reject(res);
        }
      },
      fail: (err) => {
        // 不再弹窗，直接 reject
        reject(err);
      },
    });
  });
};

// 文件上传
export const uploadFile = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: '/api/upload/image', // 只传相对路径，由拦截器统一拼接 baseUrl 和加 token
      filePath,
      name: 'file',
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          resolve(data);
        } else {
          uni.showToast({
            icon: 'none',
            title: '上传失败',
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({
          icon: 'none',
          title: '上传失败',
        });
        reject(err);
      },
    });
  });
};

// 同步用户信息
export const syncUserProfile = (userInfo) => {
  return http({
    url: '/api/users/profile',
    method: 'POST',
    data: {
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName,
    },
  });
};
