// 使用环境变量配置
export const baseUrl = process.env.NODE_ENV === 'development' 
  ? process.env.VUE_APP_BASE_URL_DEV 
  : process.env.VUE_APP_BASE_URL_PROD;

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