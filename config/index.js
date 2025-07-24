// 兼容小程序环境的环境变量写法
const env = import.meta.env.MODE;
export const baseUrl = env === 'development'
  ? import.meta.env.VITE_APP_BASE_URL_DEV
  : import.meta.env.VITE_APP_BASE_URL_PROD;

// 常量配置
export const TIMESLOTS = {
  day: {
    name: '白天',
    time: '08:00 - 20:00'
  },
  night: {
    name: '晚上',
    time: '20:00 - 08:00'
  }
};